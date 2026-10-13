import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartOfAccountsService } from '../services/chart-of-accounts';

// Mock lib helper akun
vi.mock('../lib/account-classification', () => ({
    tryParseClassification: vi.fn((type: string) => (type.startsWith('Invalid') ? null : type)),
    validateReferenceNumber: vi.fn((type: string) => !type.includes('BadCode')),
    normalBalanceIsDebit: vi.fn((type: string) => type === 'Assets' || type === 'Expenses'),
}));

// Mock schema Drizzle secara eksplisit agar ekspresi eq(schema.x.y, z) aman
vi.mock('../db/schema/chart-of-accounts', () => {
    const createDummyColumn = (name: string) => ({ name });
    return {
        chartOfAccounts: {
            id: createDummyColumn('id'),
            referenceNumber: createDummyColumn('referenceNumber'),
            accountName: createDummyColumn('accountName'),
            type: createDummyColumn('type'),
            role: createDummyColumn('role'),
            isActive: createDummyColumn('isActive'),
            userId: createDummyColumn('userId'),
        },
    };
});

vi.mock('../db/schema/general-journal', () => {
    const createDummyColumn = (name: string) => ({ name });
    return {
        generalJournal: {
            id: createDummyColumn('id'),
            accountId: createDummyColumn('accountId'),
            journalType: createDummyColumn('journalType'),
            entryDate: createDummyColumn('entryDate'),
            debit: createDummyColumn('debit'),
            credit: createDummyColumn('credit'),
            userId: createDummyColumn('userId'),
        },
    };
});

vi.mock('../db/schema/periods', () => {
    const createDummyColumn = (name: string) => ({ name });
    return {
        periods: {
            id: createDummyColumn('id'),
            periodName: createDummyColumn('periodName'),
            startDate: createDummyColumn('startDate'),
            endDate: createDummyColumn('endDate'),
            userId: createDummyColumn('userId'),
        },
        selectedPeriods: {
            userId: createDummyColumn('userId'),
            periodId: createDummyColumn('periodId'),
        },
    };
});

describe('ChartOfAccountsService', () => {
    type MockFunction = ReturnType<typeof vi.fn>;

    type QueryBuilderMock = {
        from: MockFunction;
        where: MockFunction;
        orderBy: MockFunction;
        groupBy: MockFunction;
        values: MockFunction;
        set: MockFunction;
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
        query: {
            chartOfAccounts: { findFirst: MockFunction };
            generalJournal: { findFirst: MockFunction };
            selectedPeriods: { findFirst: MockFunction };
            periods: { findFirst: MockFunction };
        };
    };

    let service: ChartOfAccountsService;
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
            builder.values = vi.fn().mockReturnValue(builder);
            builder.set = vi.fn().mockReturnValue(builder);
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
            query: {
                chartOfAccounts: {
                    findFirst: vi.fn(),
                },
                generalJournal: {
                    findFirst: vi.fn(),
                },
                selectedPeriods: {
                    findFirst: vi.fn(),
                },
                periods: {
                    findFirst: vi.fn(),
                },
            },
        };

        service = new ChartOfAccountsService(mockDb as unknown as ConstructorParameters<typeof ChartOfAccountsService>[0]);
    });

    describe('getAccounts', () => {
        it('should return empty list if user has no accounts', async () => {
            const builder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            builder.orderBy.mockResolvedValueOnce([]);
            mockDb.select.mockReturnValueOnce(builder);

            mockDb.query.selectedPeriods.findFirst.mockResolvedValueOnce(null);
            mockDb.query.periods.findFirst.mockResolvedValueOnce({ id: 1, periodName: 'January 2026' });

            const result = await service.getAccounts(mockUserId);

            expect(result).toEqual({
                success: true,
                selectedPeriodName: 'January 2026',
                accounts: [],
            });
        });

        it('should load accounts and compute balances based on journal entries in selected period', async () => {
            const mockAccounts = [
                { id: 101, referenceNumber: 101, accountName: 'Kas Utama', type: 'Assets', role: 'CashAndEquivalents', isActive: true },
                { id: 201, referenceNumber: 201, accountName: 'Hutang Usaha', type: 'Liabilities', role: 'Default', isActive: true },
            ];

            const mockPeriod = {
                id: 1,
                periodName: 'January 2026',
                startDate: new Date('2026-01-01T00:00:00Z'),
                endDate: new Date('2026-01-31T23:59:59Z'),
            };

            const mockBalances = [
                { accountId: 101, totalDebit: 5000000, totalCredit: 2000000 },
                { accountId: 201, totalDebit: 1000000, totalCredit: 4000000 },
            ];

            // 1st select for loadedAccounts
            const selectAccountsBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            selectAccountsBuilder.orderBy.mockResolvedValueOnce(mockAccounts);

            // 2nd select for journal balances
            const selectBalancesBuilder = (mockDb.select as unknown as ReturnType<typeof vi.fn>)();
            selectBalancesBuilder.groupBy.mockResolvedValueOnce(mockBalances);

            mockDb.select
                .mockReturnValueOnce(selectAccountsBuilder)
                .mockReturnValueOnce(selectBalancesBuilder);

            mockDb.query.selectedPeriods.findFirst.mockResolvedValueOnce({ userId: mockUserId, periodId: 1 });
            mockDb.query.periods.findFirst.mockResolvedValueOnce(mockPeriod);

            const result = await service.getAccounts(mockUserId, 'Kas', 'Assets');

            expect(result.success).toBe(true);
            expect(result.selectedPeriodName).toBe('January 2026');
            expect(result.accounts.length).toBe(2);
            // Debit normal balance (5000000 - 2000000)
            expect(result.accounts[0].balance).toBe(3000000);
            // Credit normal balance (4000000 - 1000000)
            expect(result.accounts[1].balance).toBe(3000000);
        });
    });

    describe('createAccount', () => {
        const createReq = {
            referenceNumber: 1010,
            accountName: 'Kas Kecil',
            type: 'Assets',
            role: 'CashAndEquivalents',
        };

        it('should fail if account name is missing', async () => {
            const result = await service.createAccount(mockUserId, { ...createReq, accountName: '' });

            expect(result).toEqual({
                isSuccess: false,
                message: 'Account name is required.',
                statusCode: 400,
            });
        });

        it('should fail if category type is invalid', async () => {
            const result = await service.createAccount(mockUserId, { ...createReq, type: 'InvalidType' });

            expect(result).toEqual({
                isSuccess: false,
                message: "Invalid account classification category 'InvalidType'.",
                statusCode: 400,
            });
        });

        it('should fail if reference number is invalid for category', async () => {
            const result = await service.createAccount(mockUserId, { ...createReq, type: 'BadCode' });

            expect(result).toEqual({
                isSuccess: false,
                message: 'Invalid reference number 1010 for category BadCode.',
                statusCode: 400,
            });
        });

        it('should fail if account reference code is already in use', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce({ id: 1, referenceNumber: 1010 });

            const result = await service.createAccount(mockUserId, createReq);

            expect(result).toEqual({
                isSuccess: false,
                message: 'Account code 1010 is already in use.',
                statusCode: 400,
            });
        });

        it('should create account successfully', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce(null);

            const insertBuilder = {
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ id: 10, accountName: 'Kas Kecil' }]),
            };
            mockDb.insert.mockReturnValueOnce(insertBuilder as any);

            const result = await service.createAccount(mockUserId, createReq);

            expect(result).toEqual({
                isSuccess: true,
                message: "Account 'Kas Kecil' successfully created.",
                accountId: 10,
                statusCode: 200,
            });
        });

        it('should return 500 status code on fatal exception', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce(null);
            mockDb.insert.mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const result = await service.createAccount(mockUserId, createReq);

            expect(result).toEqual({
                isSuccess: false,
                message: 'A fatal error occurred while saving the account: Database connection failed',
                statusCode: 500,
            });
        });
    });

    describe('updateAccount', () => {
        const updateReq = {
            referenceNumber: 1010,
            accountName: 'Kas Operasional',
            type: 'Assets',
            role: 'CashAndEquivalents',
            isActive: true,
        };

        it('should fail if target account is not found', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce(null);

            const result = await service.updateAccount(mockUserId, 999, updateReq);

            expect(result).toEqual({
                isSuccess: false,
                message: 'Account not found.',
                statusCode: 404,
            });
        });

        it('should fail if updated reference number is taken by another account', async () => {
            mockDb.query.chartOfAccounts.findFirst
                .mockResolvedValueOnce({ id: 1, accountName: 'Kas Lama' }) // target account exists
                .mockResolvedValueOnce({ id: 2, referenceNumber: 1010 }); // code taken by account ID 2

            const result = await service.updateAccount(mockUserId, 1, updateReq);

            expect(result).toEqual({
                isSuccess: false,
                message: 'Account code 1010 is already in use.',
                statusCode: 400,
            });
        });

        it('should update account successfully', async () => {
            mockDb.query.chartOfAccounts.findFirst
                .mockResolvedValueOnce({ id: 1, accountName: 'Kas Lama' })
                .mockResolvedValueOnce(null);

            const updateBuilder = {
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(true),
            };
            mockDb.update.mockReturnValueOnce(updateBuilder as any);

            const result = await service.updateAccount(mockUserId, 1, updateReq);

            expect(result).toEqual({
                isSuccess: true,
                message: "Account 'Kas Operasional' successfully updated.",
                statusCode: 200,
            });
        });
    });

    describe('deleteAccount', () => {
        it('should fail if account does not exist', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce(null);

            const result = await service.deleteAccount(mockUserId, 999);

            expect(result).toEqual({
                isSuccess: false,
                message: 'Account not found.',
                statusCode: 404,
            });
        });

        it('should fail if account has existing journal entries', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce({ id: 1, accountName: 'Kas Utama' });
            mockDb.query.generalJournal.findFirst.mockResolvedValueOnce({ id: 50, accountId: 1 });

            const result = await service.deleteAccount(mockUserId, 1);

            expect(result).toEqual({
                isSuccess: false,
                message: "Account 'Kas Utama' cannot be deleted because it already has journal entries. Set it to Inactive instead.",
                statusCode: 400,
            });
        });

        it('should delete account successfully when no journals exist', async () => {
            mockDb.query.chartOfAccounts.findFirst.mockResolvedValueOnce({ id: 1, accountName: 'Kas Baru' });
            mockDb.query.generalJournal.findFirst.mockResolvedValueOnce(null);

            const deleteBuilder = {
                where: vi.fn().mockResolvedValue(true),
            };
            mockDb.delete.mockReturnValueOnce(deleteBuilder as any);

            const result = await service.deleteAccount(mockUserId, 1);

            expect(result).toEqual({
                isSuccess: true,
                message: "Account 'Kas Baru' successfully deleted.",
                statusCode: 200,
            });
        });
    });
});