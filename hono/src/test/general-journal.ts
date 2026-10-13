import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneralJournalService } from '../services/general-journal';

// Mock schema Drizzle secara eksplisit agar ekspresi Drizzle aman dari TypeError 'undefined'
vi.mock('../db/schema/general-journal', () => {
    const createDummyColumn = (name: string) => ({
        name,
        mapWith: vi.fn().mockReturnThis(),
        asc: vi.fn().mockReturnThis(),
        desc: vi.fn().mockReturnThis(),
    });

    const createDummyTable = (tableName: string, columns: string[]) => {
        const table: Record<string, unknown> = { _: { name: tableName } };
        for (const col of columns) {
            table[col] = createDummyColumn(col);
        }
        return table;
    };

    return {
        generalJournals: createDummyTable('generalJournals', [
            'id', 'userId', 'transactionNumber', 'journalType', 'entryDate',
            'accountId', 'lineDescription', 'debit', 'credit', 'lineOrder',
            'createdAt', 'updatedAt'
        ]),
        transactionCounters: createDummyTable('transactionCounters', [
            'userId', 'counterKey', 'lastSequence'
        ]),
        chartOfAccounts: createDummyTable('chartOfAccounts', [
            'id', 'userId', 'isActive'
        ]),
        periods: createDummyTable('periods', [
            'id', 'userId', 'startDate', 'endDate', 'isClosed'
        ]),
    };
});

describe('GeneralJournalService', () => {
    type MockFunction = ReturnType<typeof vi.fn>;

    type QueryBuilderMock = {
        from: MockFunction;
        where: MockFunction;
        orderBy: MockFunction;
        groupBy: MockFunction;
        limit: MockFunction;
        values: MockFunction;
        set: MockFunction;
        onConflictDoUpdate: MockFunction;
        returning: MockFunction;
        then: (onfulfilled: (value: unknown) => unknown) => Promise<unknown>;
        catch: (onrejected: (reason: unknown) => unknown) => Promise<unknown>;
    };

    type MockDatabase = {
        select: MockFunction;
        from: MockFunction;
        where: MockFunction;
        orderBy: MockFunction;
        update: MockFunction;
        delete: MockFunction;
        insert: MockFunction;
        transaction: MockFunction;
        query: {
            generalJournals: { findFirst: MockFunction };
            chartOfAccounts: { findFirst: MockFunction };
            periods: { findFirst: MockFunction };
        };
    };

    let service: GeneralJournalService;
    let mockDb: MockDatabase;

    const mockUserId = 'user-uuid-1234';

    beforeEach(() => {
        vi.clearAllMocks();

        const createQueryBuilder = (resolveData: unknown = []) => {
            const builder = {} as QueryBuilderMock;

            builder.from = vi.fn().mockReturnValue(builder);
            builder.where = vi.fn().mockReturnValue(builder);
            builder.orderBy = vi.fn().mockReturnValue(builder);
            builder.groupBy = vi.fn().mockReturnValue(builder);
            builder.limit = vi.fn().mockReturnValue(builder);
            builder.values = vi.fn().mockReturnValue(builder);
            builder.set = vi.fn().mockReturnValue(builder);
            builder.onConflictDoUpdate = vi.fn().mockReturnValue(builder);
            builder.returning = vi.fn().mockResolvedValue(resolveData);

            builder.then = (onfulfilled) => Promise.resolve(resolveData).then(onfulfilled);
            builder.catch = (onrejected) => Promise.resolve(resolveData).catch(onrejected);

            return builder;
        };

        mockDb = {
            select: vi.fn().mockImplementation(() => createQueryBuilder([])),
            from: vi.fn().mockImplementation(() => createQueryBuilder([])),
            where: vi.fn().mockImplementation(() => createQueryBuilder([])),
            orderBy: vi.fn().mockImplementation(() => createQueryBuilder([])),
            update: vi.fn().mockImplementation(() => createQueryBuilder([])),
            delete: vi.fn().mockImplementation(() => createQueryBuilder([])),
            insert: vi.fn().mockImplementation(() => createQueryBuilder([])),
            transaction: vi.fn(async (cb: (tx: MockDatabase) => unknown) => cb(mockDb)),
            query: {
                generalJournals: {
                    findFirst: vi.fn(),
                },
                chartOfAccounts: {
                    findFirst: vi.fn(),
                },
                periods: {
                    findFirst: vi.fn(),
                },
            },
        };

        service = new GeneralJournalService(mockDb as unknown as ConstructorParameters<typeof GeneralJournalService>[0]);
    });

    describe('generate & peekNext', () => {
        it('should generate a valid transaction number using counter', async () => {
            const insertBuilder = {
                values: vi.fn().mockReturnThis(),
                onConflictDoUpdate: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ lastSequence: 5 }]),
            };
            mockDb.insert.mockReturnValueOnce(insertBuilder as any);

            const entryDate = new Date('2026-03-15');
            const result = await service.generate(mockUserId, 'General', entryDate);

            expect(result).toBe('GJ26030005');
        });

        it('should generate Adjusting type counter with AJ prefix', async () => {
            const insertBuilder = {
                values: vi.fn().mockReturnThis(),
                onConflictDoUpdate: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ lastSequence: 1 }]),
            };
            mockDb.insert.mockReturnValueOnce(insertBuilder as any);

            const entryDate = new Date('2026-12-31');
            const result = await service.generate(mockUserId, 'Adjusting', entryDate);

            expect(result).toBe('AJ26120001');
        });

        it('should throw error if sequence reaches over 9999', async () => {
            const insertBuilder = {
                values: vi.fn().mockReturnThis(),
                onConflictDoUpdate: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ lastSequence: 10000 }]),
            };
            mockDb.insert.mockReturnValueOnce(insertBuilder as any);

            const entryDate = new Date('2026-03-15');
            await expect(service.generate(mockUserId, 'General', entryDate)).rejects.toThrow('Sequence GJ2603 reached 9999');
        });

        it('should peek next transaction number without incrementing sequence', async () => {
            const selectBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            selectBuilder.limit.mockResolvedValueOnce([{ lastSequence: 12 }]);
            mockDb.select.mockReturnValueOnce(selectBuilder);

            const entryDate = new Date('2026-05-10');
            const result = await service.peekNext(mockUserId, 'General', entryDate);

            expect(result).toBe('GJ26050013');
        });

        it('should default next sequence to 0001 if no counter row exists yet', async () => {
            const selectBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            selectBuilder.limit.mockResolvedValueOnce([]);
            mockDb.select.mockReturnValueOnce(selectBuilder);

            const entryDate = new Date('2026-05-10');
            const result = await service.getNextTransactionNumber(mockUserId, 'General', entryDate);

            expect(result).toBe('GJ26050001');
        });
    });

    describe('getById', () => {
        it('should return null if anchor journal entry is not found', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce(null);

            const result = await service.getById(mockUserId, 999);

            expect(result).toBeNull();
        });

        it('should map and return journal entry group response correctly', async () => {
            const anchor = {
                id: 1,
                transactionNumber: 'GJ26010001',
                journalType: 'General',
                entryDate: new Date('2026-01-10'),
                createdAt: new Date('2026-01-10T08:00:00Z'),
                updatedAt: null,
                userId: mockUserId,
            };

            const linesRows = [
                { id: 1, accountId: 101, lineDescription: 'Kas', debit: '100000', credit: '0', lineOrder: 0 },
                { id: 2, accountId: 401, lineDescription: 'Pendapatan', debit: '0', credit: '100000', lineOrder: 1 },
            ];

            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce(anchor);

            // Mock select for lines
            const linesBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            linesBuilder.orderBy.mockResolvedValueOnce(linesRows);

            // Mock select for closed periods
            const periodsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            periodsBuilder.where.mockResolvedValueOnce([]);

            mockDb.select
                .mockReturnValueOnce(linesBuilder)
                .mockReturnValueOnce(periodsBuilder);

            const result = await service.getById(mockUserId, 1);

            expect(result).not.toBeNull();
            expect(result?.transactionNumber).toBe('GJ26010001');
            expect(result?.lines.length).toBe(2);
            expect(result?.isLocked).toBe(false);
            expect(result?.lines[0].debit).toBe('100000');
        });
    });

    describe('create', () => {
        const createReq = {
            journalType: 'General',
            entryDate: new Date('2026-02-15'),
            lines: [
                { accountId: 101, lineDescription: 'Debit Line', debit: 150000, credit: 0 },
                { accountId: 201, lineDescription: 'Credit Line', debit: 0, credit: 150000 },
            ],
        };

        it('should throw error if effective lines are less than 2', async () => {
            const invalidReq = {
                entryDate: new Date('2026-02-15'),
                lines: [{ accountId: 101, debit: 100000, credit: 0 }],
            };

            await expect(service.create(mockUserId, invalidReq)).rejects.toThrow('A journal entry must have at least two line items.');
        });

        it('should throw error if total debit does not equal total credit', async () => {
            const unbalancedReq = {
                entryDate: new Date('2026-02-15'),
                lines: [
                    { accountId: 101, debit: 150000, credit: 0 },
                    { accountId: 201, debit: 0, credit: 100000 },
                ],
            };

            await expect(service.create(mockUserId, unbalancedReq)).rejects.toThrow('Total debit must equal total credit before posting.');
        });

        it('should throw error if any account is invalid or inactive', async () => {
            // Valid active account IDs returned in DB query
            const validAccountsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            validAccountsBuilder.where.mockResolvedValueOnce([{ id: 101 }]); // Account 201 missing
            mockDb.select.mockReturnValueOnce(validAccountsBuilder);

            await expect(service.create(mockUserId, createReq)).rejects.toThrow('One or more selected accounts are invalid or inactive.');
        });

        it('should throw error if entry date falls within a closed period', async () => {
            // Mock valid accounts
            const validAccountsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            validAccountsBuilder.where.mockResolvedValueOnce([{ id: 101 }, { id: 201 }]);

            // Mock closed period
            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([{
                startDate: new Date('2026-02-01'),
                endDate: new Date('2026-02-28'),
            }]);

            mockDb.select
                .mockReturnValueOnce(validAccountsBuilder)
                .mockReturnValueOnce(closedPeriodBuilder);

            await expect(service.create(mockUserId, createReq)).rejects.toThrow('This date falls within a closed accounting period.');
        });

        it('should post journal entry successfully when valid', async () => {
            const validAccountsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            validAccountsBuilder.where.mockResolvedValueOnce([{ id: 101 }, { id: 201 }]);

            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([]);

            mockDb.select
                .mockReturnValueOnce(validAccountsBuilder)
                .mockReturnValueOnce(closedPeriodBuilder);

            // Mock counter generation insert
            const counterInsertBuilder = {
                values: vi.fn().mockReturnThis(),
                onConflictDoUpdate: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ lastSequence: 1 }]),
            };

            // Mock journal entry insertion
            const journalInsertBuilder = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ id: 1001 }]),
            };

            mockDb.insert
                .mockReturnValueOnce(counterInsertBuilder as any)
                .mockReturnValueOnce(journalInsertBuilder as any);

            const result = await service.create(mockUserId, createReq);

            expect(result.entryId).toBe(1001);
            expect(result.transactionNumber).toBe('GJ26020001');
            expect(result.message).toContain('Journal entry GJ26020001 has been posted.');
        });
    });

    describe('update', () => {
        const updateReq = {
            journalType: 'General',
            entryDate: new Date('2026-03-20'),
            lines: [
                { accountId: 101, debit: 200000, credit: 0 },
                { accountId: 201, debit: 0, credit: 200000 },
            ],
        };

        it('should throw error if journal entry to update is not found', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce(null);

            await expect(service.update(mockUserId, 999, updateReq)).rejects.toThrow('Journal entry not found.');
        });

        it('should throw error if original entry date falls in closed period', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce({
                id: 1,
                transactionNumber: 'GJ26010001',
                entryDate: new Date('2026-01-15'),
            });

            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([{
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-01-31'),
            }]);
            mockDb.select.mockReturnValueOnce(closedPeriodBuilder);

            await expect(service.update(mockUserId, 1, updateReq)).rejects.toThrow('Journal entry GJ26010001 falls within a closed period and cannot be modified.');
        });

        it('should update journal entry successfully', async () => {
            const anchor = {
                id: 1,
                transactionNumber: 'GJ26030001',
                journalType: 'General',
                entryDate: new Date('2026-03-10'),
                createdAt: new Date('2026-03-10'),
            };

            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce(anchor);

            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([]);

            const validAccountsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            validAccountsBuilder.where.mockResolvedValueOnce([{ id: 101 }, { id: 201 }]);

            mockDb.select
                .mockReturnValueOnce(closedPeriodBuilder)
                .mockReturnValueOnce(validAccountsBuilder);

            const deleteBuilder = { where: vi.fn().mockResolvedValue(true) };
            mockDb.delete.mockReturnValueOnce(deleteBuilder as any);

            const insertBuilder = { values: vi.fn().mockResolvedValue(true) };
            mockDb.insert.mockReturnValueOnce(insertBuilder as any);

            await service.update(mockUserId, 1, updateReq);

            expect(mockDb.delete).toHaveBeenCalled();
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should throw error if journal entry is not found', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce(null);

            await expect(service.delete(mockUserId, 999)).rejects.toThrow('Journal entry not found.');
        });

        it('should throw error if transaction is in a closed period', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce({
                id: 1,
                transactionNumber: 'GJ26010001',
                entryDate: new Date('2026-01-15'),
            });

            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([{
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-01-31'),
            }]);
            mockDb.select.mockReturnValueOnce(closedPeriodBuilder);

            await expect(service.delete(mockUserId, 1)).rejects.toThrow('Cannot delete transactions in closed accounting periods.');
        });

        it('should delete journal entry successfully', async () => {
            mockDb.query.generalJournals.findFirst.mockResolvedValueOnce({
                id: 1,
                transactionNumber: 'GJ26030001',
                entryDate: new Date('2026-03-15'),
            });

            const closedPeriodBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            closedPeriodBuilder.where.mockResolvedValueOnce([]);
            mockDb.select.mockReturnValueOnce(closedPeriodBuilder);

            const deleteBuilder = { where: vi.fn().mockResolvedValue(true) };
            mockDb.delete.mockReturnValueOnce(deleteBuilder as any);

            await service.delete(mockUserId, 1);

            expect(mockDb.delete).toHaveBeenCalled();
        });
    });

    describe('searchDescriptions', () => {
        it('should return empty array if query length is less than 2', async () => {
            const result = await service.searchDescriptions(mockUserId, 'a');

            expect(result).toEqual([]);
        });

        it('should search line descriptions and return grouped strings', async () => {
            const mockRows = [
                { description: 'Pembelian Perlengkapan Kantor' },
                { description: 'Pembelian Bahan Baku' },
            ];

            const searchBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            searchBuilder.limit.mockResolvedValueOnce(mockRows);
            mockDb.select.mockReturnValueOnce(searchBuilder);

            const result = await service.searchDescriptions(mockUserId, 'Beli');

            expect(result).toEqual(['Pembelian Perlengkapan Kantor', 'Pembelian Bahan Baku']);
        });
    });
});