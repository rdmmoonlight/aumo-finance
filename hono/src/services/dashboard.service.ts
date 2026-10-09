import { and, asc, eq, inArray, sql } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import { selectedPeriodHelper } from '../lib/selected-period.js';
import type { CashAccountItem, ChartTrendItem, DashboardData, ExpenseAccountItem } from '../types/dashboard.type.js';

// Pengganti IDashboardService / DashboardService C#

export class DashboardService {
    async getDashboardData(userId: string, period: string = 'monthly'): Promise<DashboardData> {
        const activePeriod = await selectedPeriodHelper.getSelectedPeriod(userId);

        const now = new Date();
        const year = activePeriod ? new Date(activePeriod.startDate).getFullYear() : now.getFullYear();

        // Monthly range - dari selected period atau current month
        const monthlyStart = activePeriod
            ? new Date(activePeriod.startDate)
            : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));

        const monthlyEndBase = activePeriod
            ? new Date(activePeriod.endDate)
            : new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

        const monthlyEnd = new Date(monthlyEndBase);
        monthlyEnd.setHours(23, 59, 59, 999);

        // Annual range
        const annualStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const annualEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

        const isAnnual = period.toLowerCase() === 'annual';
        const reqStart = isAnnual ? annualStart : monthlyStart;
        const reqEnd = isAnnual ? annualEnd : monthlyEnd;
        const displayPeriodName = isAnnual ? `Annual ${year}` : (activePeriod as any)?.periodName || 'Current Period';

        // Fetch lines - monthly, annual, cumulative (sama seperti C# AsNoTracking + ToListAsync)
        const monthlyLines = await db
            .select({
                accountId: schema.journalEntryLines.accountId,
                debit: sql<number>`${schema.journalEntryLines.debit}::float`.as('debit'),
                credit: sql<number>`${schema.journalEntryLines.credit}::float`.as('credit'),
                entryDate: schema.journalEntries.entryDate
            })
            .from(schema.journalEntryLines)
            .innerJoin(schema.journalEntries, eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id))
            .where(
                and(
                    eq(schema.journalEntries.userId, userId),
                    sql`${schema.journalEntries.entryDate} >= ${monthlyStart.toISOString()}::timestamp`,
                    sql`${schema.journalEntries.entryDate} <= ${monthlyEnd.toISOString()}::timestamp`
                )
            );

        const annualLines = await db
            .select({
                accountId: schema.journalEntryLines.accountId,
                debit: sql<number>`${schema.journalEntryLines.debit}::float`.as('debit'),
                credit: sql<number>`${schema.journalEntryLines.credit}::float`.as('credit'),
                entryDate: schema.journalEntries.entryDate
            })
            .from(schema.journalEntryLines)
            .innerJoin(schema.journalEntries, eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id))
            .where(
                and(
                    eq(schema.journalEntries.userId, userId),
                    sql`${schema.journalEntries.entryDate} >= ${annualStart.toISOString()}::timestamp`,
                    sql`${schema.journalEntries.entryDate} <= ${annualEnd.toISOString()}::timestamp`
                )
            );

        const periodLines = isAnnual ? annualLines : monthlyLines;

        const cumulativeLines = await db
            .select({
                accountId: schema.journalEntryLines.accountId,
                debit: sql<number>`${schema.journalEntryLines.debit}::float`.as('debit'),
                credit: sql<number>`${schema.journalEntryLines.credit}::float`.as('credit')
            })
            .from(schema.journalEntryLines)
            .innerJoin(schema.journalEntries, eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id))
            .where(
                and(
                    eq(schema.journalEntries.userId, userId),
                    sql`${schema.journalEntries.entryDate} <= ${reqEnd.toISOString()}::timestamp`
                )
            );

        // 1. Kas & Bank
        const cashBankAccounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true),
                eq(schema.chartOfAccounts.role, 'CashAndEquivalents')
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        const isBankAccount = (name: string) => {
            const lower = name.toLowerCase();
            return lower.includes('bank') || lower.includes('rekening');
        };

        const buildCashBreakdown = (lines: { accountId: number; debit: number; credit: number }[]): CashAccountItem[] => {
            return cashBankAccounts.map(a => {
                const bal = lines
                    .filter(l => l.accountId === a.id)
                    .reduce((sum, l) => sum + (l.debit - l.credit), 0);
                return {
                    accountId: String(a.id),
                    referenceNumber: String(a.referenceNumber),
                    accountName: a.accountName,
                    balance: Math.round(bal * 100) / 100,
                    isBank: isBankAccount(a.accountName)
                };
            });
        };

        const monthlyCashBreakdown = buildCashBreakdown(monthlyLines as any);
        const annualCashBreakdown = buildCashBreakdown(annualLines as any);
        const cumulativeCashBreakdown = buildCashBreakdown(cumulativeLines as any);

        const totalCashOnHandMonthly = monthlyCashBreakdown.filter(x => !x.isBank).reduce((s, x) => s + x.balance, 0);
        const totalBankBalanceMonthly = monthlyCashBreakdown.filter(x => x.isBank).reduce((s, x) => s + x.balance, 0);
        const totalAssetsMonthly = monthlyCashBreakdown.reduce((s, x) => s + x.balance, 0);

        const totalCashOnHandAnnual = annualCashBreakdown.filter(x => !x.isBank).reduce((s, x) => s + x.balance, 0);
        const totalBankBalanceAnnual = annualCashBreakdown.filter(x => x.isBank).reduce((s, x) => s + x.balance, 0);
        const totalAssetsAnnual = annualCashBreakdown.reduce((s, x) => s + x.balance, 0);

        const totalCashOnHand = isAnnual ? totalCashOnHandAnnual : totalCashOnHandMonthly;
        const totalBankBalance = isAnnual ? totalBankBalanceAnnual : totalBankBalanceMonthly;
        const totalAssets = isAnnual ? totalAssetsAnnual : totalAssetsMonthly;

        // 2. Pendapatan & Beban
        const incomeTypes = ['OperatingIncome', 'Income', 'Revenue'];
        const incomeAccounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true),
                inArray(schema.chartOfAccounts.type, incomeTypes as any)
            )
        });
        const incomeIds = incomeAccounts.map(a => a.id);
        const totalIncome = periodLines
            .filter(l => incomeIds.includes(l.accountId))
            .reduce((s, l: any) => s + (l.credit - l.debit), 0);

        const expenseTypes = ['OperatingExpenses', 'Expense', 'Expenses'];
        const expenseAccountsMeta = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true),
                inArray(schema.chartOfAccounts.type, expenseTypes as any)
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        const expenseBreakdown: ExpenseAccountItem[] = expenseAccountsMeta
            .map(a => {
                const bal = periodLines
                    .filter((l: any) => l.accountId === a.id)
                    .reduce((s, l: any) => s + (l.debit - l.credit), 0);
                return {
                    accountId: String(a.id),
                    referenceNumber: String(a.referenceNumber),
                    accountName: a.accountName,
                    balance: Math.round(bal * 100) / 100
                };
            })
            .filter(a => a.balance !== 0);

        const totalExpense = expenseBreakdown.filter(x => x.balance > 0).reduce((s, x) => s + x.balance, 0);
        const netIncome = totalIncome - totalExpense;

        // 3. Liabilities & Equity
        const liabilityTypes = ['Liabilities', 'Liability'];
        const liabilityAccounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true),
                inArray(schema.chartOfAccounts.type, liabilityTypes as any)
            )
        });
        const liabilityIds = liabilityAccounts.map(a => a.id);

        const totalLiabilitiesMonthly = monthlyLines
            .filter((l: any) => liabilityIds.includes(l.accountId))
            .reduce((s, l: any) => s + (l.credit - l.debit), 0);

        const totalLiabilitiesAnnual = annualLines
            .filter((l: any) => liabilityIds.includes(l.accountId))
            .reduce((s, l: any) => s + (l.credit - l.debit), 0);

        const totalLiabilities = isAnnual ? totalLiabilitiesAnnual : totalLiabilitiesMonthly;

        const totalLiabilitiesCumulative = cumulativeLines
            .filter((l: any) => liabilityIds.includes(l.accountId))
            .reduce((s, l: any) => s + (l.credit - l.debit), 0);

        const equityAccounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true),
                eq(schema.chartOfAccounts.type, 'Equity')
            )
        });
        const equityIds = equityAccounts.map(a => a.id);
        const totalEquity = cumulativeLines
            .filter((l: any) => equityIds.includes(l.accountId))
            .reduce((s, l: any) => s + (l.credit - l.debit), 0);

        // 4. Chart Trend Data
        let trendData: ChartTrendItem[] = [];

        if (isAnnual) {
            trendData = Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const monthLines = periodLines.filter((l: any) => new Date(l.entryDate).getMonth() + 1 === m);
                const rev = monthLines
                    .filter((l: any) => incomeIds.includes(l.accountId))
                    .reduce((s, l: any) => s + (l.credit - l.debit), 0);
                const exp = monthLines
                    .filter((l: any) => expenseAccountsMeta.map(e => e.id).includes(l.accountId))
                    .reduce((s, l: any) => s + (l.debit - l.credit), 0);
                return {
                    label: new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'short' }),
                    revenue: Math.round(rev * 100) / 100,
                    expense: Math.round(exp * 100) / 100,
                    net: Math.round((rev - exp) * 100) / 100
                };
            });
        } else {
            // Group by date
            const grouped = new Map<string, typeof periodLines>();
            for (const line of periodLines) {
                const dateKey = new Date((line as any).entryDate).toISOString().split('T')[0];
                if (!grouped.has(dateKey)) grouped.set(dateKey, []);
                grouped.get(dateKey)!.push(line);
            }

            const sortedKeys = Array.from(grouped.keys()).sort();
            trendData = sortedKeys.map(key => {
                const group = grouped.get(key)!;
                const rev = group
                    .filter((l: any) => incomeIds.includes(l.accountId))
                    .reduce((s, l: any) => s + (l.credit - l.debit), 0);
                const exp = group
                    .filter((l: any) => expenseAccountsMeta.map(e => e.id).includes(l.accountId))
                    .reduce((s, l: any) => s + (l.debit - l.credit), 0);
                const date = new Date(key);
                return {
                    label: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                    revenue: Math.round(rev * 100) / 100,
                    expense: Math.round(exp * 100) / 100,
                    net: Math.round((rev - exp) * 100) / 100
                };
            });
        }

        const activeCashBreakdown = isAnnual ? annualCashBreakdown : monthlyCashBreakdown;

        return {
            success: true,
            hasPeriodSelected: !!activePeriod,
            selectedPeriodName: displayPeriodName,
            isPeriodClosed: (activePeriod as any)?.isClosed || false,

            totalAssets: Math.round(totalAssets * 100) / 100,
            totalCashOnHand: Math.round(totalCashOnHand * 100) / 100,
            totalBankBalance: Math.round(totalBankBalance * 100) / 100,
            totalLiabilities: Math.round(totalLiabilities * 100) / 100,

            totalAssetsMonthly: Math.round(totalAssetsMonthly * 100) / 100,
            totalAssetsAnnual: Math.round(totalAssetsAnnual * 100) / 100,
            totalCashOnHandMonthly: Math.round(totalCashOnHandMonthly * 100) / 100,
            totalCashOnHandAnnual: Math.round(totalCashOnHandAnnual * 100) / 100,
            totalBankBalanceMonthly: Math.round(totalBankBalanceMonthly * 100) / 100,
            totalBankBalanceAnnual: Math.round(totalBankBalanceAnnual * 100) / 100,
            totalLiabilitiesMonthly: Math.round(totalLiabilitiesMonthly * 100) / 100,
            totalLiabilitiesAnnual: Math.round(totalLiabilitiesAnnual * 100) / 100,

            totalAssetsCumulative: Math.round(cumulativeCashBreakdown.reduce((s, x) => s + x.balance, 0) * 100) / 100,
            totalCashOnHandCumulative: Math.round(cumulativeCashBreakdown.filter(x => !x.isBank).reduce((s, x) => s + x.balance, 0) * 100) / 100,
            totalBankBalanceCumulative: Math.round(cumulativeCashBreakdown.filter(x => x.isBank).reduce((s, x) => s + x.balance, 0) * 100) / 100,
            totalLiabilitiesCumulative: Math.round(totalLiabilitiesCumulative * 100) / 100,

            totalEquity: Math.round(totalEquity * 100) / 100,
            totalRevenue: Math.round(totalIncome * 100) / 100,
            totalExpenses: Math.round(totalExpense * 100) / 100,
            netIncome: Math.round(netIncome * 100) / 100,

            cashAccounts: activeCashBreakdown.filter(x => !x.isBank),
            bankAccounts: activeCashBreakdown.filter(x => x.isBank),
            cashAccountsMonthly: monthlyCashBreakdown.filter(x => !x.isBank),
            bankAccountsMonthly: monthlyCashBreakdown.filter(x => x.isBank),
            cashAccountsAnnual: annualCashBreakdown.filter(x => !x.isBank),
            bankAccountsAnnual: annualCashBreakdown.filter(x => x.isBank),

            expenseAccountsList: expenseBreakdown,
            chartTrend: trendData,
            recentEntries: []
        };
    }
}

export const dashboardService = new DashboardService();
