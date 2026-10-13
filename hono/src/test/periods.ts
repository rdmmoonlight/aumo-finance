import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PeriodsService } from '../services/periods';

// Mock schema Drizzle secara eksplisit agar ekspresi eq(schema.x.y, z) tidak melempar TypeError 'undefined'
vi.mock('../db/schema/periods', () => {
    const createDummyColumn = (name: string) => ({
        name,
        mapWith: vi.fn().mockReturnThis(),
        asc: vi.fn().mockReturnThis(),
        desc: vi.fn().mockReturnThis(),
        nullsLast: vi.fn().mockReturnThis(),
        op: vi.fn().mockReturnThis(),
    });

    const createDummyTable = (tableName: string, columns: string[]) => {
        const table: Record<string, unknown> = { _: { name: tableName } };
        for (const col of columns) {
            table[col] = createDummyColumn(col);
        }
        return table;
    };

    return {
        periods: createDummyTable('periods', ['id', 'periodName', 'startDate', 'endDate', 'isClosed', 'isSelected', 'userId']),
        chartOfAccounts: createDummyTable('chartOfAccounts', ['id', 'referenceNumber', 'accountName', 'type', 'displayLabel', 'isActive', 'userId', 'role']),
        selectedPeriods: createDummyTable('selectedPeriods', ['userId', 'periodId', 'updatedAt']),
        journalEntries: createDummyTable('journalEntries', ['id', 'userId', 'transactionNumber', 'journalType', 'entryDate', 'createdAt']),
        journalEntryLines: createDummyTable('journalEntryLines', ['id', 'journalEntryId', 'accountId', 'debit', 'credit', 'lineDescription', 'lineOrder']),
    };
});

describe('PeriodsService', () => {
    type MockFunction = ReturnType<typeof vi.fn>;

    type QueryBuilderMock = {
        from: MockFunction;
        where: MockFunction;
        orderBy: MockFunction;
        groupBy: MockFunction;
        innerJoin: MockFunction;
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
            periods: { findFirst: MockFunction };
            chartOfAccounts: { findFirst: MockFunction };
        };
    };

    let service: PeriodsService;
    let mockDb: MockDatabase;
    let mockTxNumberService: { generate: MockFunction };
    let mockGlService: { refreshGeneralLedgers: MockFunction; clearSelectedPeriodLedgers: MockFunction };

    const mockUserId = 'user-uuid-1234';

    beforeEach(() => {
        vi.clearAllMocks();

        const createQueryBuilder = (resolveData: unknown = []) => {
            const builder = {} as QueryBuilderMock;

            builder.from = vi.fn().mockReturnValue(builder);
            builder.where = vi.fn().mockReturnValue(builder);
            builder.orderBy = vi.fn().mockReturnValue(builder);
            builder.groupBy = vi.fn().mockReturnValue(builder);
            builder.innerJoin = vi.fn().mockReturnValue(builder);
            builder.values = vi.fn().mockReturnValue(builder);
            builder.set = vi.fn().mockReturnValue(builder);
            builder.onConflictDoUpdate = vi.fn().mockResolvedValue(true);
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
                periods: {
                    findFirst: vi.fn(),
                },
                chartOfAccounts: {
                    findFirst: vi.fn(),
                },
            },
        };

        mockTxNumberService = {
            generate: vi.fn().mockResolvedValue('TRX-2026-0001'),
        };

        mockGlService = {
            refreshGeneralLedgers: vi.fn().mockResolvedValue(undefined),
            clearSelectedPeriodLedgers: vi.fn().mockResolvedValue(undefined),
        };

        service = new PeriodsService(
            mockDb as unknown as ConstructorParameters<typeof PeriodsService>[0],
            mockTxNumberService as unknown as ConstructorParameters<typeof PeriodsService>[1],
            mockGlService as unknown as ConstructorParameters<typeof PeriodsService>[2],
        );
    });

    describe('getPeriods', () => {
        it('should return empty list when user has no periods', async () => {
            const builder = (mockDb.select as unknown as ReturnType<typeof createQueryBuilder>)();
            builder.orderBy.mockResolvedValueOnce([]);
            mockDb.select.mockReturnValueOnce(builder);

            const result = await service.getPeriods(mockUserId);

            expect(result).toEqual({
                success: true,
                selectedPeriodId: null,
                periods: [],
            });
        });

        it('should return periods and identify selectedPeriodId correctly', async () => {
            const mockData = [
                { id: 2, periodName: 'February 2026', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28'), isClosed: false, isSelected: true },
                { id: 1, periodName: 'January 2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31'), isClosed: true, isSelected: false },
            ];

            const builder = (mockDb.select as unknown as ReturnType<typeof createQueryBuilder>)();
            builder.orderBy.mockResolvedValueOnce(mockData);
            mockDb.select.mockReturnValueOnce(builder);

            const result = await service.getPeriods(mockUserId);

            expect(result.success).toBe(true);
            expect(result.selectedPeriodId).toBe(2);
            expect(result.periods.length).toBe(2);
            expect(result.periods[0].isSelected).toBe(true);
        });
    });

    describe('getOpenPeriodInfo', () => {
        it('should structure accounts correctly into permanent, cash/bank, and retained earnings', async () => {
            const mockAccounts = [
                { id: 101, referenceNumber: 101, accountName: 'Cash', type: 'Assets', role: 'CashAndEquivalents', displayLabel: 'Cash', isActive: true },
                { id: 102, referenceNumber: 102, accountName: 'Bank', type: 'Assets', role: 'CashAndEquivalents', displayLabel: 'Bank', isActive: true },
                { id: 301, referenceNumber: 301, accountName: 'Retained Earnings', type: 'Equity', role: 'RetainedEarnings', displayLabel: 'RE', isActive: true },
            ];

            const builder = (mockDb.select as unknown as ReturnType<typeof createQueryBuilder>)();
            builder.orderBy.mockResolvedValueOnce(mockAccounts);
            mockDb.select.mockReturnValueOnce(builder);

            const result = await service.getOpenPeriodInfo(mockUserId);

            expect(result.success).toBe(true);
            expect(result.hasExistingPermanentAccounts).toBe(true);
            expect(result.availableCashAndBankAccounts.length).toBe(2);
            expect(result.availableRetainedEarningsAccounts.length).toBe(1);
            expect(result.permanentAccounts.length).toBe(3);
        });
    });

    describe('createPeriod', () => {
        const createRequestNew = {
            year: 2026,
            month: 1,
            setupMode: 'CreateNew' as const,
            cashAccountCode: '1010',
            cashAccountName: 'Kas Utama',
            bankAccountCode: '1020',
            bankAccountName: 'Bank BCA',
            retainedEarningsAccountCode: '3010',
            retainedEarningsAccountName: 'Laba Ditahan',
            cashBalance: 1000000,
            bankBalance: 5000000,
        };

        it('should fail if the period already exists', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce({ id: 1, periodName: 'January 2026' });

            const result = await service.createPeriod(mockUserId, createRequestNew);

            expect(result).toEqual({
                success: false,
                message: 'Period January 2026 already exists.',
            });
        });

        it('should fail when creating new accounts if reference codes are not numeric', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);

            const invalidRequest = { ...createRequestNew, cashAccountCode: 'ABC' };
            const result = await service.createPeriod(
                mockUserId,
                invalidRequest as Parameters<PeriodsService['createPeriod']>[1],
            );

            expect(result).toEqual({
                success: false,
                message: 'Account reference codes must be numeric.',
            });
        });

        it('should fail when creating new accounts if reference codes are duplicate', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);

            const invalidRequest = { ...createRequestNew, cashAccountCode: '1010', bankAccountCode: '1010' };
            const result = await service.createPeriod(
                mockUserId,
                invalidRequest as Parameters<PeriodsService['createPeriod']>[1],
            );

            expect(result).toEqual({
                success: false,
                message: 'Cash, Bank, and Retained Earnings accounts must use different reference numbers.',
            });
        });

        it('should fail if account reference codes are already in use in Chart of Accounts', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce({ id: 99, referenceNumber: 1010 });

            const result = await service.createPeriod(
                mockUserId,
                createRequestNew as Parameters<PeriodsService['createPeriod']>[1],
            );

            expect(result).toEqual({
                success: false,
                message: 'One or more account reference numbers are already in use in your Chart of Accounts.',
            });
        });

        it('should create new period and generate opening balance journal when setupMode is CreateNew', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce(null);

            let insertCount = 0;
            mockDb.insert.mockImplementation(() => {
                insertCount++;
                const returningData =
                    insertCount === 1 ? [{ id: 101 }] :
                        insertCount === 2 ? [{ id: 102 }] :
                            insertCount === 3 ? [{ id: 301 }] :
                                insertCount === 4 ? [{ id: 1, periodName: 'January 2026' }] :
                                    [{ id: 500 }];

                const chain = {
                    values: vi.fn(),
                    returning: vi.fn().mockResolvedValue(returningData),
                };
                chain.values.mockReturnValue(chain);
                return chain;
            });

            const result = await service.createPeriod(
                mockUserId,
                createRequestNew as Parameters<PeriodsService['createPeriod']>[1],
            );

            expect(result.success).toBe(true);
            expect(result.message).toContain('Period January 2026 has been opened successfully.');
            expect(mockTxNumberService.generate).toHaveBeenCalled();
        });

        it('should fail when setupMode is LoadExisting and selected account is missing', async () => {
            const loadRequest = {
                year: 2026,
                month: 2,
                setupMode: 'LoadExisting' as const,
                cashAccountId: 101,
                bankAccountId: 102,
                retainedEarningsAccountId: 301,
            };

            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);
            mockDb.query.chartOfAccounts.findFirst
                .mockResolvedValueOnce({ id: 101, role: 'CashAndEquivalents' })
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 301, role: 'RetainedEarnings' });

            const result = await service.createPeriod(
                mockUserId,
                loadRequest as Parameters<PeriodsService['createPeriod']>[1],
            );

            expect(result).toEqual({
                success: false,
                message: 'One or more selected accounts could not be found.',
            });
        });
    });

    describe('selectPeriod', () => {
        it('should return null if period is not found', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);

            const result = await service.selectPeriod(mockUserId, 999);

            expect(result).toBeNull();
        });

        it('should update period selections and call GL service refresh', async () => {
            const mockPeriod = { id: 10, periodName: 'March 2026', isClosed: false };
            mockDb.query.periods.findFirst.mockResolvedValueOnce(mockPeriod);

            const result = await service.selectPeriod(mockUserId, 10);

            expect(result).toEqual({
                success: true,
                selectedPeriodId: 10,
                message: 'Now viewing March 2026.',
            });
            expect(mockGlService.refreshGeneralLedgers).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('clearSelection', () => {
        it('should clear period selection and invoke glService clear', async () => {
            const result = await service.clearSelection(mockUserId);

            expect(result).toEqual({
                success: true,
                message: 'Period selection cleared.',
            });
            expect(mockGlService.clearSelectedPeriodLedgers).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('closePeriod', () => {
        it('should fail if period does not exist', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce(null);

            const result = await service.closePeriod(mockUserId, 1);

            expect(result).toEqual({
                success: false,
                message: 'Accounting period not found.',
            });
        });

        it('should fail if period is already closed', async () => {
            mockDb.query.periods.findFirst.mockResolvedValueOnce({ id: 1, periodName: 'January 2026', isClosed: true });

            const result = await service.closePeriod(mockUserId, 1);

            expect(result).toEqual({
                success: false,
                message: 'Period January 2026 is already closed.',
            });
        });

        it('should fail if there is an earlier open period', async () => {
            mockDb.query.periods.findFirst
                .mockResolvedValueOnce({ id: 2, periodName: 'February 2026', startDate: new Date('2026-02-01'), isClosed: false })
                .mockResolvedValueOnce({ id: 1, periodName: 'January 2026', startDate: new Date('2026-01-01'), isClosed: false });

            const result = await service.closePeriod(mockUserId, 2);

            expect(result).toEqual({
                success: false,
                message: 'Cannot close February 2026: an earlier period is still open. Close earlier periods first.',
            });
        });

        it('should close period successfully when all checks pass', async () => {
            mockDb.query.periods.findFirst
                .mockResolvedValueOnce({ id: 2, periodName: 'February 2026', startDate: new Date('2026-02-01'), isClosed: false })
                .mockResolvedValueOnce(null);

            const result = await service.closePeriod(mockUserId, 2);

            expect(result).toEqual({
                success: true,
                message: 'Period February 2026 has been closed. Transactions in this period are now locked.',
            });
            expect(mockDb.update).toHaveBeenCalled();
        });
    });
});