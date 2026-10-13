import { and, asc, desc, eq, gte, inArray, lt, lte, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as accountSchema from '../db/schema/chart-of-accounts';
import * as generalJournalSchema from '../db/schema/general-journal';
import * as periodSchema from '../db/schema/periods';

const PermanentTypes = ['Assets', 'Liabilities', 'Equity'] as const;
const TemporaryTypes = ['OperatingIncome', 'OtherIncome', 'OperatingExpenses', 'OtherExpenses'] as const;

type DrizzleDb = NodePgDatabase<
    typeof periodSchema & typeof accountSchema & typeof generalJournalSchema
>;
type Tx = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0];

export type BaseServiceResult = {
    success: boolean;
    message: string;
};

export type SelectPeriodResult = {
    success: true;
    selectedPeriodId: number;
    message: string;
};

export type CreatePeriodResult =
    | { success: true; message: string; periodId: number }
    | { success: false; message: string; isServerError?: boolean };

export type CreatePeriodRequest =
    | {
        year: number;
        month: number;
        setupMode: 'CreateNew';
        cashAccountCode?: string;
        cashAccountName?: string;
        bankAccountCode?: string;
        bankAccountName?: string;
        retainedEarningsAccountCode?: string;
        retainedEarningsAccountName?: string;
        cashBalance?: number;
        bankBalance?: number;
    }
    | {
        year: number;
        month: number;
        setupMode: 'LoadExisting';
        cashAccountId?: number;
        bankAccountId?: number;
        retainedEarningsAccountId?: number;
    };

type AccountSimpleDto = Pick<
    typeof accountSchema.chartOfAccounts.$inferSelect,
    'id' | 'referenceNumber' | 'accountName' | 'type'
> & { displayLabel: string };

type OpenPeriodInfoResponse = {
    success: true;
    hasExistingPermanentAccounts: boolean;
    availableCashAndBankAccounts: AccountSimpleDto[];
    availableRetainedEarningsAccounts: AccountSimpleDto[];
    permanentAccounts: AccountSimpleDto[];
};

interface ITransactionNumberService {
    generate(userId: string, type: 'General', date: Date): Promise<string>;
}

interface IGeneralLedgersService {
    refreshGeneralLedgers(userId: string): Promise<void>;
    clearSelectedPeriodLedgers(userId: string): Promise<void>;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const fail = (message: string): CreatePeriodResult => ({ success: false, message });

export class PeriodsService {
    constructor(
        private db: DrizzleDb,
        private txNumberService: ITransactionNumberService,
        private glService: IGeneralLedgersService
    ) { }

    async getPeriods(userId: string) {
        const periodsData = await this.db
            .select({
                id: periodSchema.periods.id,
                periodName: periodSchema.periods.periodName,
                startDate: periodSchema.periods.startDate,
                endDate: periodSchema.periods.endDate,
                isClosed: periodSchema.periods.isClosed,
                isSelected: periodSchema.periods.isSelected,
            })
            .from(periodSchema.periods)
            .where(eq(periodSchema.periods.userId, userId))
            .orderBy(desc(periodSchema.periods.startDate));

        const selectedPeriodId = periodsData.find((p) => p.isSelected)?.id ?? null;

        const periods = periodsData.map((p) => ({
            ...p,
            isSelected: selectedPeriodId ? p.id === selectedPeriodId : p.isSelected,
        }));

        return { success: true, selectedPeriodId, periods };
    }

    async getOpenPeriodInfo(userId: string): Promise<OpenPeriodInfoResponse> {
        const accounts = await this.db
            .select()
            .from(accountSchema.chartOfAccounts)
            .where(
                and(
                    eq(accountSchema.chartOfAccounts.userId, userId),
                    eq(accountSchema.chartOfAccounts.isActive, true)
                )
            )
            .orderBy(asc(accountSchema.chartOfAccounts.referenceNumber));

        const toDto = (a: (typeof accounts)[number]): AccountSimpleDto => ({
            id: a.id,
            referenceNumber: a.referenceNumber,
            accountName: a.accountName,
            type: a.type,
            displayLabel: `${a.referenceNumber} - ${a.accountName}`,
        });

        const permanentAccounts = accounts
            .filter((a) => (PermanentTypes as readonly string[]).includes(a.type))
            .map(toDto);
        const availableCashAndBank = accounts
            .filter((a) => a.role === 'CashAndEquivalents')
            .map(toDto);
        const availableRetainedEarnings = accounts
            .filter((a) => a.role === 'RetainedEarnings')
            .map(toDto);

        return {
            success: true,
            hasExistingPermanentAccounts:
                availableCashAndBank.length > 0 && availableRetainedEarnings.length > 0,
            availableCashAndBankAccounts: availableCashAndBank,
            availableRetainedEarningsAccounts: availableRetainedEarnings,
            permanentAccounts,
        };
    }

    async createPeriod(userId: string, request: CreatePeriodRequest): Promise<CreatePeriodResult> {
        const startDate = new Date(Date.UTC(request.year, request.month - 1, 1));
        const endDate = new Date(Date.UTC(request.year, request.month, 0));
        const periodName = startDate.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
        const isLoadExisting = request.setupMode === 'LoadExisting';

        try {
            return await this.db.transaction(async (tx) => {
                const exists = await tx.query.periods.findFirst({
                    where: and(
                        eq(periodSchema.periods.userId, userId),
                        eq(periodSchema.periods.startDate, startDate)
                    ),
                });
                if (exists) return fail(`Period ${periodName} already exists.`);

                if (isLoadExisting) {
                    const [cashAcc, bankAcc, retainedAcc] = await Promise.all([
                        tx.query.chartOfAccounts.findFirst({
                            where: and(
                                eq(accountSchema.chartOfAccounts.id, request.cashAccountId!),
                                eq(accountSchema.chartOfAccounts.userId, userId)
                            ),
                        }),
                        tx.query.chartOfAccounts.findFirst({
                            where: and(
                                eq(accountSchema.chartOfAccounts.id, request.bankAccountId!),
                                eq(accountSchema.chartOfAccounts.userId, userId)
                            ),
                        }),
                        tx.query.chartOfAccounts.findFirst({
                            where: and(
                                eq(
                                    accountSchema.chartOfAccounts.id,
                                    request.retainedEarningsAccountId!
                                ),
                                eq(accountSchema.chartOfAccounts.userId, userId)
                            ),
                        }),
                    ]);

                    if (!cashAcc || !bankAcc || !retainedAcc)
                        return fail('One or more selected accounts could not be found.');
                    if (retainedAcc.role !== 'RetainedEarnings')
                        return fail(
                            'The selected Retained Earnings account is not a Retained Earnings account.'
                        );

                    const [newPeriod] = await tx
                        .insert(periodSchema.periods)
                        .values({
                            userId,
                            periodName,
                            startDate,
                            endDate,
                            isClosed: false,
                            isSelected: false,
                        })
                        .returning();

                    const opening = await this.addOpeningBalanceJournal(
                        tx,
                        userId,
                        startDate,
                        retainedAcc
                    );
                    if (opening.error) {
                        tx.rollback();
                        return fail(opening.error);
                    }

                    const carryInfo =
                        opening.accountCount > 0
                            ? ` Saldo Awal journal created for ${opening.accountCount} permanent accounts.`
                            : ' No previous period balances to carry forward.';

                    return {
                        success: true,
                        message: `Period ${newPeriod.periodName} has been opened successfully.${carryInfo}`,
                        periodId: newPeriod.id,
                    };
                } else {
                    const cashCode = parseInt(request.cashAccountCode!, 10);
                    const bankCode = parseInt(request.bankAccountCode!, 10);
                    const retainedCode = parseInt(request.retainedEarningsAccountCode!, 10);

                    if (
                        Number.isNaN(cashCode) ||
                        Number.isNaN(bankCode) ||
                        Number.isNaN(retainedCode)
                    )
                        return fail('Account reference codes must be numeric.');
                    if (
                        cashCode === bankCode ||
                        cashCode === retainedCode ||
                        bankCode === retainedCode
                    )
                        return fail(
                            'Cash, Bank, and Retained Earnings accounts must use different reference numbers.'
                        );

                    const codeInUse = await tx.query.chartOfAccounts.findFirst({
                        where: and(
                            eq(accountSchema.chartOfAccounts.userId, userId),
                            inArray(accountSchema.chartOfAccounts.referenceNumber, [
                                cashCode,
                                bankCode,
                                retainedCode,
                            ])
                        ),
                    });
                    if (codeInUse)
                        return fail(
                            'One or more account reference numbers are already in use in your Chart of Accounts.'
                        );

                    const [cashAccount] = await tx
                        .insert(accountSchema.chartOfAccounts)
                        .values({
                            userId,
                            referenceNumber: cashCode,
                            accountName: request.cashAccountName!.trim(),
                            type: 'Assets',
                            role: 'CashAndEquivalents',
                            isActive: true,
                        })
                        .returning();

                    const [bankAccount] = await tx
                        .insert(accountSchema.chartOfAccounts)
                        .values({
                            userId,
                            referenceNumber: bankCode,
                            accountName: request.bankAccountName!.trim(),
                            type: 'Assets',
                            role: 'CashAndEquivalents',
                            isActive: true,
                        })
                        .returning();

                    const [retainedAccount] = await tx
                        .insert(accountSchema.chartOfAccounts)
                        .values({
                            userId,
                            referenceNumber: retainedCode,
                            accountName: request.retainedEarningsAccountName!.trim(),
                            type: 'Equity',
                            role: 'RetainedEarnings',
                            isActive: true,
                        })
                        .returning();

                    const [newPeriod] = await tx
                        .insert(periodSchema.periods)
                        .values({
                            userId,
                            periodName,
                            startDate,
                            endDate,
                            isClosed: false,
                            isSelected: false,
                        })
                        .returning();

                    const cashBalance = request.cashBalance ?? 0;
                    const bankBalance = request.bankBalance ?? 0;
                    const totalOpening = cashBalance + bankBalance;

                    if (totalOpening !== 0) {
                        const trxNumber = await this.txNumberService.generate(
                            userId,
                            'General',
                            startDate
                        );
                        const entryId = Date.now(); // Menggunakan timestamp unik sebagai entryId
                        const nowString = new Date().toISOString();
                        const entryDateString = startDate.toISOString();

                        const lines = [];

                        if (cashBalance !== 0) {
                            lines.push({
                                entryId,
                                userId,
                                transactionNumber: trxNumber,
                                journalType: 'General',
                                entryDate: entryDateString,
                                description: 'Saldo Awal',
                                accountId: cashAccount.id,
                                accountNumber: cashAccount.referenceNumber,
                                debit: String(cashBalance),
                                credit: '0',
                                status: 'Posted',
                                createdAt: nowString,
                            });
                        }

                        if (bankBalance !== 0) {
                            lines.push({
                                entryId,
                                userId,
                                transactionNumber: trxNumber,
                                journalType: 'General',
                                entryDate: entryDateString,
                                description: 'Saldo Awal',
                                accountId: bankAccount.id,
                                accountNumber: bankAccount.referenceNumber,
                                debit: String(bankBalance),
                                credit: '0',
                                status: 'Posted',
                                createdAt: nowString,
                            });
                        }

                        lines.push({
                            entryId,
                            userId,
                            transactionNumber: trxNumber,
                            journalType: 'General',
                            entryDate: entryDateString,
                            description: 'Saldo Awal',
                            accountId: retainedAccount.id,
                            accountNumber: retainedAccount.referenceNumber,
                            debit: '0',
                            credit: String(totalOpening),
                            status: 'Posted',
                            createdAt: nowString,
                        });

                        await tx.insert(generalJournalSchema.generalJournal).values(lines);
                    }

                    return {
                        success: true,
                        message: `Period ${newPeriod.periodName} has been opened successfully.`,
                        periodId: newPeriod.id,
                    };
                }
            });
        } catch (e: any) {
            return {
                success: false,
                isServerError: true,
                message: `Failed to open period: ${e?.cause?.message ?? e?.message ?? e}`,
            };
        }
    }

    private async addOpeningBalanceJournal(
        tx: Tx,
        userId: string,
        startDate: Date,
        retainedAccount: typeof accountSchema.chartOfAccounts.$inferSelect
    ) {
        const previous = await tx.query.periods.findFirst({
            where: and(
                eq(periodSchema.periods.userId, userId),
                lt(periodSchema.periods.startDate, startDate)
            ),
            orderBy: desc(periodSchema.periods.startDate),
        });
        if (!previous) return { accountCount: 0, error: null as string | null };

        const prevStart = new Date(previous.startDate);
        prevStart.setUTCHours(0, 0, 0, 0);
        const prevEnd = new Date(previous.endDate);
        prevEnd.setUTCHours(23, 59, 59, 999);

        if (!(PermanentTypes as readonly string[]).includes(retainedAccount.type)) {
            return {
                accountCount: 0,
                error: 'The selected Retained Earnings account must be an Equity account.',
            };
        }

        const accounts = await tx
            .select()
            .from(accountSchema.chartOfAccounts)
            .where(
                and(
                    eq(accountSchema.chartOfAccounts.userId, userId),
                    eq(accountSchema.chartOfAccounts.isActive, true)
                )
            );
        const allAccounts = accounts.some((a) => a.id === retainedAccount.id)
            ? accounts
            : [...accounts, retainedAccount];

        // Query totals dari tabel generalJournal
        const totalsRows = await tx
            .select({
                accountId: generalJournalSchema.generalJournal.accountId,
                debit: sql<number>`sum(${generalJournalSchema.generalJournal.debit}::decimal)`.mapWith(Number),
                credit: sql<number>`sum(${generalJournalSchema.generalJournal.credit}::decimal)`.mapWith(Number),
            })
            .from(generalJournalSchema.generalJournal)
            .where(
                and(
                    eq(generalJournalSchema.generalJournal.userId, userId),
                    inArray(generalJournalSchema.generalJournal.journalType, ['General', 'Adjusting']),
                    gte(generalJournalSchema.generalJournal.entryDate, prevStart.toISOString()),
                    lte(generalJournalSchema.generalJournal.entryDate, prevEnd.toISOString())
                )
            )
            .groupBy(generalJournalSchema.generalJournal.accountId);

        const totals = new Map(
            totalsRows
                .filter((r): r is typeof r & { accountId: number } => r.accountId !== null)
                .map((r) => [r.accountId, { debit: r.debit ?? 0, credit: r.credit ?? 0 }])
        );

        const signed = (accountId: number) => {
            const t = totals.get(accountId);
            return t ? t.debit - t.credit : 0;
        };

        const netIncome = allAccounts
            .filter((a) => (TemporaryTypes as readonly string[]).includes(a.type))
            .reduce((sum, a) => sum + -signed(a.id), 0);

        const balances: { account: (typeof allAccounts)[number]; signed: number }[] = [];
        for (const acc of allAccounts
            .filter((a) => (PermanentTypes as readonly string[]).includes(a.type))
            .sort((a, b) => a.referenceNumber - b.referenceNumber)) {
            let bal = signed(acc.id);
            if (acc.id === retainedAccount.id) bal -= netIncome;
            bal = round2(bal);
            if (bal !== 0) balances.push({ account: acc, signed: bal });
        }

        if (balances.length === 0) return { accountCount: 0, error: null };

        const totalDebit = balances
            .filter((b) => b.signed > 0)
            .reduce((s, b) => s + b.signed, 0);
        const totalCredit = balances
            .filter((b) => b.signed < 0)
            .reduce((s, b) => s + Math.abs(b.signed), 0);

        if (round2(totalDebit - totalCredit) !== 0) {
            return {
                accountCount: 0,
                error: `Saldo Awal is not balanced (debit ${totalDebit.toFixed(2)} vs credit ${totalCredit.toFixed(2)}). Check the journals of ${previous.periodName}.`,
            };
        }

        const trxNumber = await this.txNumberService.generate(userId, 'General', startDate);
        const entryId = Date.now();
        const nowString = new Date().toISOString();
        const entryDateString = startDate.toISOString();

        const journalRows = balances.map((b) => ({
            entryId,
            userId,
            transactionNumber: trxNumber,
            journalType: 'General',
            entryDate: entryDateString,
            description: 'Saldo Awal',
            accountId: b.account.id,
            accountNumber: b.account.referenceNumber,
            debit: b.signed > 0 ? String(b.signed) : '0',
            credit: b.signed < 0 ? String(Math.abs(b.signed)) : '0',
            status: 'Posted',
            createdAt: nowString,
        }));

        await tx.insert(generalJournalSchema.generalJournal).values(journalRows);

        return { accountCount: balances.length, error: null };
    }

    async selectPeriod(userId: string, periodId: number): Promise<SelectPeriodResult | null> {
        const entity = await this.db.query.periods.findFirst({
            where: and(
                eq(periodSchema.periods.id, periodId),
                eq(periodSchema.periods.userId, userId)
            ),
        });
        if (!entity) return null;

        await this.db
            .update(periodSchema.periods)
            .set({ isSelected: false })
            .where(
                and(
                    eq(periodSchema.periods.userId, userId),
                    eq(periodSchema.periods.isSelected, true)
                )
            );
        await this.db
            .update(periodSchema.periods)
            .set({ isSelected: true })
            .where(
                and(
                    eq(periodSchema.periods.id, periodId),
                    eq(periodSchema.periods.userId, userId)
                )
            );

        await this.db
            .insert(periodSchema.selectedPeriods)
            .values({ userId, periodId: entity.id, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: periodSchema.selectedPeriods.userId,
                set: { periodId: entity.id, updatedAt: new Date() },
            });

        await this.glService.refreshGeneralLedgers(userId);

        return {
            success: true,
            selectedPeriodId: entity.id,
            message: `Now viewing ${entity.periodName}${entity.isClosed ? ' (Closed).' : '.'}`,
        };
    }

    async clearSelection(userId: string): Promise<BaseServiceResult> {
        await this.glService.clearSelectedPeriodLedgers(userId);
        await this.db
            .update(periodSchema.periods)
            .set({ isSelected: false })
            .where(
                and(
                    eq(periodSchema.periods.userId, userId),
                    eq(periodSchema.periods.isSelected, true)
                )
            );
        await this.db
            .delete(periodSchema.selectedPeriods)
            .where(eq(periodSchema.selectedPeriods.userId, userId));
        return { success: true, message: 'Period selection cleared.' };
    }

    async closePeriod(userId: string, periodId: number): Promise<BaseServiceResult> {
        const entity = await this.db.query.periods.findFirst({
            where: and(
                eq(periodSchema.periods.id, periodId),
                eq(periodSchema.periods.userId, userId)
            ),
        });
        if (!entity) return { success: false, message: 'Accounting period not found.' };
        if (entity.isClosed)
            return { success: false, message: `Period ${entity.periodName} is already closed.` };

        const hasEarlierOpen = await this.db.query.periods.findFirst({
            where: and(
                eq(periodSchema.periods.userId, userId),
                lt(periodSchema.periods.startDate, entity.startDate),
                eq(periodSchema.periods.isClosed, false),
                ne(periodSchema.periods.id, entity.id)
            ),
        });
        if (hasEarlierOpen)
            return {
                success: false,
                message: `Cannot close ${entity.periodName}: an earlier period is still open. Close earlier periods first.`,
            };

        await this.db
            .update(periodSchema.periods)
            .set({ isClosed: true })
            .where(eq(periodSchema.periods.id, entity.id));
        return {
            success: true,
            message: `Period ${entity.periodName} has been closed. Transactions in this period are now locked.`,
        };
    }
}