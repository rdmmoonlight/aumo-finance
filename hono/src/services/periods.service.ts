import { generalLedgersService } from '@/services/reports/general-ledgers.service.js';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import { logger } from '../lib/logger.js';
import { selectedPeriodHelper } from '../lib/selected-period.js';
import type {
    AccountSimpleDto,
    BaseServiceResult,
    CreatePeriodRequest,
    CreatePeriodResult,
    GetPeriodsResponse,
    OpenPeriodInfoResponse,
    PeriodDto,
    SelectPeriodResult
} from '../types/periods.type.js';
import { transactionNumberService } from './transaction-number.service.js';

const PERMANENT_TYPES = ['Assets', 'Asset', 'Liabilities', 'Liability', 'Equity'];
const TEMPORARY_TYPES = ['OperatingIncome', 'OtherIncome', 'OperatingExpenses', 'OtherExpenses', 'Revenue', 'Expense'];

export class PeriodsService {
    async getPeriods(userId: string): Promise<GetPeriodsResponse> {
        const periodsData = await db.query.periods.findMany({
            where: eq(schema.periods.userId, userId),
            orderBy: [desc(schema.periods.startDate)]
        });

        // Map ke PeriodDto
        const mapped: PeriodDto[] = periodsData.map(p => ({
            id: p.id,
            periodName: p.periodName,
            startDate: p.startDate,
            endDate: p.endDate,
            isClosed: p.isClosed,
            isSelected: (p as any).isSelected || false
        }));

        let selectedPeriod = mapped.find(p => p.isSelected);
        let selectedPeriodId: number | null = selectedPeriod?.id || null;

        if (!selectedPeriodId) {
            const fromHelper = await selectedPeriodHelper.getSelectedPeriod(userId);
            if (fromHelper) selectedPeriodId = (fromHelper as any).id;
        }

        const periods = mapped.map(p => ({
            ...p,
            isSelected: selectedPeriodId ? p.id === selectedPeriodId : p.isSelected
        }));

        return {
            success: true,
            selectedPeriodId,
            periods
        };
    }

    async getOpenPeriodInfo(userId: string): Promise<OpenPeriodInfoResponse> {
        const accounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        const toSimple = (a: any): AccountSimpleDto => ({
            id: a.id,
            referenceNumber: a.referenceNumber,
            accountName: a.accountName,
            type: a.type,
            displayLabel: `${a.referenceNumber} - ${a.accountName}`
        });

        const permanentAccounts = accounts
            .filter(a => PERMANENT_TYPES.includes(a.type))
            .map(toSimple);

        const availableCashAndBank = accounts
            .filter(a => a.role === 'CashAndEquivalents')
            .map(toSimple);

        const availableRetainedEarnings = accounts
            .filter(a => a.role === 'RetainedEarnings')
            .map(toSimple);

        const hasExistingPermanentAccounts = availableCashAndBank.length > 0 && availableRetainedEarnings.length > 0;

        return {
            success: true,
            hasExistingPermanentAccounts,
            availableCashAndBankAccounts: availableCashAndBank,
            availableRetainedEarningsAccounts: availableRetainedEarnings,
            permanentAccounts
        };
    }

    async createPeriod(userId: string, request: CreatePeriodRequest): Promise<CreatePeriodResult> {
        const startDate = new Date(Date.UTC(request.year, request.month - 1, 1));
        const endDate = new Date(Date.UTC(request.year, request.month, 0, 23, 59, 59, 999)); // last day of month
        // Fix endDate: add 1 month -1 day
        const endDateCorrect = new Date(startDate);
        endDateCorrect.setUTCMonth(endDateCorrect.getUTCMonth() + 1);
        endDateCorrect.setUTCDate(0);
        endDateCorrect.setUTCHours(23, 59, 59, 999);

        const periodName = startDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        const isLoadExisting = request.setupMode === 'LoadExisting';

        const fail = (msg: string): CreatePeriodResult => ({ success: false, message: msg });

        try {
            return await db.transaction(async (tx) => {
                // Cek duplikat periode
                const periodExists = await tx.query.periods.findFirst({
                    where: and(
                        eq(schema.periods.userId, userId),
                        eq(schema.periods.startDate, startDate)
                    )
                });

                if (periodExists) {
                    return fail(`Period ${periodName} already exists.`);
                }

                if (isLoadExisting) {
                    // Validasi akun existing
                    const cashAccount = request.cashAccountId
                        ? await tx.query.chartOfAccounts.findFirst({
                            where: and(eq(schema.chartOfAccounts.id, request.cashAccountId), eq(schema.chartOfAccounts.userId, userId))
                        })
                        : null;
                    const bankAccount = request.bankAccountId
                        ? await tx.query.chartOfAccounts.findFirst({
                            where: and(eq(schema.chartOfAccounts.id, request.bankAccountId), eq(schema.chartOfAccounts.userId, userId))
                        })
                        : null;
                    const retainedAccount = request.retainedEarningsAccountId
                        ? await tx.query.chartOfAccounts.findFirst({
                            where: and(eq(schema.chartOfAccounts.id, request.retainedEarningsAccountId), eq(schema.chartOfAccounts.userId, userId))
                        })
                        : null;

                    if (!cashAccount || !bankAccount || !retainedAccount) {
                        return fail('One or more selected accounts could not be found.');
                    }

                    if (retainedAccount.role !== 'RetainedEarnings') {
                        return fail('The selected Retained Earnings account is not a Retained Earnings account.');
                    }

                    const [newPeriod] = await tx.insert(schema.periods).values({
                        userId,
                        periodName,
                        startDate,
                        endDate: endDateCorrect,
                        isClosed: false,
                        isSelected: false
                    } as any).returning();

                    const opening = await this.addOpeningBalanceJournal(tx, userId, startDate, retainedAccount as any);

                    if (opening.error) {
                        // Rollback akan terjadi karena throw? Kita return fail dan biarkan tx rollback via error
                        // Untuk simple, kita throw
                        throw new Error(opening.error);
                    }

                    const carryInfo = opening.accountCount > 0
                        ? ` Saldo Awal journal created for ${opening.accountCount} permanent accounts.`
                        : ' No previous period balances to carry forward.';

                    return {
                        success: true,
                        message: `Period ${newPeriod.periodName} has been opened successfully.${carryInfo}`,
                        periodId: newPeriod.id
                    };
                } else {
                    // Mode New - bikin akun baru
                    const cashCode = parseInt(request.cashAccountCode || '', 10);
                    const bankCode = parseInt(request.bankAccountCode || '', 10);
                    const retainedCode = parseInt(request.retainedEarningsAccountCode || '', 10);

                    if (isNaN(cashCode) || isNaN(bankCode) || isNaN(retainedCode)) {
                        return fail('Account reference codes must be numeric.');
                    }

                    if (cashCode === bankCode || cashCode === retainedCode || bankCode === retainedCode) {
                        return fail('Cash, Bank, and Retained Earnings accounts must use different reference numbers.');
                    }

                    const existingCodes = await tx.query.chartOfAccounts.findMany({
                        where: and(
                            eq(schema.chartOfAccounts.userId, userId),
                            inArray(schema.chartOfAccounts.referenceNumber, [cashCode, bankCode, retainedCode])
                        )
                    });

                    if (existingCodes.length > 0) {
                        return fail('One or more account reference numbers are already in use in your Chart of Accounts.');
                    }

                    const [cashAccount] = await tx.insert(schema.chartOfAccounts).values({
                        userId,
                        referenceNumber: cashCode,
                        accountName: request.cashAccountName!.trim(),
                        type: 'Assets',
                        role: 'CashAndEquivalents',
                        isActive: true
                    }).returning();

                    const [bankAccount] = await tx.insert(schema.chartOfAccounts).values({
                        userId,
                        referenceNumber: bankCode,
                        accountName: request.bankAccountName!.trim(),
                        type: 'Assets',
                        role: 'CashAndEquivalents',
                        isActive: true
                    }).returning();

                    const [retainedAccount] = await tx.insert(schema.chartOfAccounts).values({
                        userId,
                        referenceNumber: retainedCode,
                        accountName: request.retainedEarningsAccountName!.trim(),
                        type: 'Equity',
                        role: 'RetainedEarnings',
                        isActive: true
                    }).returning();

                    const [newPeriod] = await tx.insert(schema.periods).values({
                        userId,
                        periodName,
                        startDate,
                        endDate: endDateCorrect,
                        isClosed: false,
                        isSelected: false
                    } as any).returning();

                    const cashBalance = request.cashBalance || 0;
                    const bankBalance = request.bankBalance || 0;
                    const totalOpening = cashBalance + bankBalance;

                    if (totalOpening !== 0) {
                        const transactionNumber = await transactionNumberService.generate(userId, 'General', startDate);

                        const [journalEntry] = await tx.insert(schema.journalEntries).values({
                            userId,
                            transactionNumber,
                            journalType: 'General',
                            entryDate: startDate,
                            createdAt: new Date()
                        }).returning();

                        const lines: any[] = [];
                        let order = 0;
                        if (cashBalance !== 0) {
                            lines.push({
                                journalEntryId: journalEntry.id,
                                accountId: cashAccount.id,
                                debit: String(cashBalance),
                                credit: '0',
                                lineDescription: 'Saldo Awal',
                                lineOrder: order++
                            });
                        }
                        if (bankBalance !== 0) {
                            lines.push({
                                journalEntryId: journalEntry.id,
                                accountId: bankAccount.id,
                                debit: String(bankBalance),
                                credit: '0',
                                lineDescription: 'Saldo Awal',
                                lineOrder: order++
                            });
                        }
                        lines.push({
                            journalEntryId: journalEntry.id,
                            accountId: retainedAccount.id,
                            debit: '0',
                            credit: String(totalOpening),
                            lineDescription: 'Saldo Awal',
                            lineOrder: order++
                        });

                        await tx.insert(schema.journalEntryLines).values(lines);
                    }

                    return {
                        success: true,
                        message: `Period ${newPeriod.periodName} has been opened successfully.`,
                        periodId: newPeriod.id
                    };
                }
            });
        } catch (ex: any) {
            logger.error({ err: ex, userId }, 'Failed to create period');
            // Jika ex dari fail yang kita throw dengan message custom
            if (ex.message && !ex.message.includes('Failed to open period')) {
                // Cek apakah ini error dari opening balance
                return { success: false, message: ex.message };
            }
            return {
                success: false,
                isServerError: true,
                message: `Failed to open period: ${ex.message}`
            };
        }
    }

    private async addOpeningBalanceJournal(
        tx: any,
        userId: string,
        startDate: Date,
        retainedAccount: any
    ): Promise<{ accountCount: number; error: string | null }> {
        const previous = await tx.query.periods.findFirst({
            where: and(
                eq(schema.periods.userId, userId),
                sql`${schema.periods.startDate} < ${startDate}`
            ),
            orderBy: [desc(schema.periods.startDate)]
        });

        if (!previous) return { accountCount: 0, error: null };

        const prevStart = new Date(previous.startDate);
        prevStart.setHours(0, 0, 0, 0);
        const prevEnd = new Date(previous.endDate);
        prevEnd.setHours(23, 59, 59, 999);

        if (!PERMANENT_TYPES.includes(retainedAccount.type)) {
            return { accountCount: 0, error: 'The selected Retained Earnings account must be an Equity account.' };
        }

        const accounts = await tx.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            )
        });

        if (!accounts.find((a: any) => a.id === retainedAccount.id)) {
            accounts.push(retainedAccount);
        }

        const totals = await tx
            .select({
                accountId: schema.journalEntryLines.accountId,
                debit: sql<number>`sum(${schema.journalEntryLines.debit}::float)`.as('debit'),
                credit: sql<number>`sum(${schema.journalEntryLines.credit}::float)`.as('credit')
            })
            .from(schema.journalEntryLines)
            .innerJoin(schema.journalEntries, eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id))
            .where(
                and(
                    eq(schema.journalEntries.userId, userId),
                    inArray(schema.journalEntries.journalType, ['General', 'Adjusting']),
                    sql`${schema.journalEntries.entryDate} >= ${prevStart} AND ${schema.journalEntries.entryDate} <= ${prevEnd}`
                )
            )
            .groupBy(schema.journalEntryLines.accountId);

        const totalsMap = new Map<number, { debit: number; credit: number }>();
        for (const t of totals) {
            totalsMap.set(t.accountId, { debit: t.debit || 0, credit: t.credit || 0 });
        }

        const signed = (account: any) => {
            const t = totalsMap.get(account.id);
            return t ? t.debit - t.credit : 0;
        };

        const netIncome = accounts
            .filter((a: any) => TEMPORARY_TYPES.includes(a.type))
            .reduce((sum: number, a: any) => sum + -signed(a), 0);

        const balances: { account: any; signed: number }[] = [];
        for (const account of accounts.filter((a: any) => PERMANENT_TYPES.includes(a.type)).sort((a: any, b: any) => a.referenceNumber - b.referenceNumber)) {
            let balance = signed(account);
            if (account.id === retainedAccount.id) {
                balance -= netIncome;
            }
            balance = Math.round(balance * 100) / 100;
            if (balance !== 0) balances.push({ account, signed: balance });
        }

        if (balances.length === 0) return { accountCount: 0, error: null };

        const totalDebit = balances.filter(b => b.signed > 0).reduce((s, b) => s + b.signed, 0);
        const totalCredit = balances.filter(b => b.signed < 0).reduce((s, b) => s + -b.signed, 0);

        if (Math.round((totalDebit - totalCredit) * 100) / 100 !== 0) {
            return {
                accountCount: 0,
                error: `Saldo Awal is not balanced (debit ${totalDebit.toFixed(2)} vs credit ${totalCredit.toFixed(2)}). Check the journals of ${previous.periodName}.`
            };
        }

        const transactionNumber = await transactionNumberService.generate(userId, 'General', startDate);

        const [journalEntry] = await tx.insert(schema.journalEntries).values({
            userId,
            transactionNumber,
            journalType: 'General',
            entryDate: startDate,
            createdAt: new Date()
        }).returning();

        const lines = balances.map((b, idx) => ({
            journalEntryId: journalEntry.id,
            accountId: b.account.id,
            debit: b.signed > 0 ? String(b.signed) : '0',
            credit: b.signed < 0 ? String(-b.signed) : '0',
            lineDescription: 'Saldo Awal',
            lineOrder: idx
        }));

        await tx.insert(schema.journalEntryLines).values(lines);

        return { accountCount: balances.length, error: null };
    }

    async selectPeriod(userId: string, periodId: number): Promise<SelectPeriodResult | null> {
        const entity = await db.query.periods.findFirst({
            where: and(eq(schema.periods.id, periodId), eq(schema.periods.userId, userId))
        });

        if (!entity) return null;

        // Clear selected
        await db.update(schema.periods).set({ isSelected: false } as any)
            .where(and(eq(schema.periods.userId, userId), eq(schema.periods.isSelected as any, true)));

        // Set selected
        await db.update(schema.periods).set({ isSelected: true } as any)
            .where(and(eq(schema.periods.id, periodId), eq(schema.periods.userId, userId)));

        await selectedPeriodHelper.selectPeriod(userId, entity.id);

        await generalLedgersService.refreshGeneralLedgers(userId);

        return {
            success: true,
            selectedPeriodId: entity.id,
            message: `Now viewing ${entity.periodName}` + (entity.isClosed ? ' (Closed).' : '.')
        };
    }

    async clearSelection(userId: string): Promise<BaseServiceResult> {
        await generalLedgersService.clearSelectedPeriodLedgers(userId);

        await db.update(schema.periods).set({ isSelected: false } as any)
            .where(and(eq(schema.periods.userId, userId), eq(schema.periods.isSelected as any, true)));

        await selectedPeriodHelper.clearSelection(userId);

        return {
            success: true,
            message: 'Period selection cleared.'
        };
    }

    async closePeriod(userId: string, periodId: number): Promise<BaseServiceResult> {
        const entity = await db.query.periods.findFirst({
            where: and(eq(schema.periods.id, periodId), eq(schema.periods.userId, userId))
        });

        if (!entity) {
            return { success: false, message: 'Accounting period not found.' };
        }

        if (entity.isClosed) {
            return { success: false, message: `Period ${entity.periodName} is already closed.` };
        }

        const hasEarlierOpen = await db.query.periods.findFirst({
            where: and(
                eq(schema.periods.userId, userId),
                sql`${schema.periods.id} != ${entity.id}`,
                sql`${schema.periods.startDate} < ${entity.startDate}`,
                eq(schema.periods.isClosed, false)
            )
        });

        if (hasEarlierOpen) {
            return {
                success: false,
                message: `Cannot close ${entity.periodName}: an earlier period is still open. Close earlier periods first.`
            };
        }

        await db.update(schema.periods).set({ isClosed: true } as any)
            .where(eq(schema.periods.id, periodId));

        return {
            success: true,
            message: `Period ${entity.periodName} has been closed. Transactions in this period are now locked.`
        };
    }
}

export const periodsService = new PeriodsService();
