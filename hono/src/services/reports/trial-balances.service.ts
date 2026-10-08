// Updated - TrialBalanceService versi lengkap 1:1 sama C#
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { isPermanent, isTemporary, normalBalanceIsDebit } from '../lib/account-classification.js';
import { db } from '../lib/db.js';
import type { TrialBalanceRow } from '../types/trial-balance.type.js';

export type ReportType = 'unadjusted' | 'adjusted' | 'post-closing';

export class TrialBalanceService {
    /**
     * BuildTrialBalanceRowsAsync - 1:1 sama C#
     * @param userId 
     * @param period 
     * @param includeAdjusting - include journal type Adjusting
     * @param reportType - unadjusted | adjusted | post-closing
     */
    async buildTrialBalanceRows(
        userId: string,
        period: { startDate: Date; endDate: Date },
        includeAdjusting: boolean = false,
        reportType: ReportType = 'unadjusted'
    ): Promise<TrialBalanceRow[]> {
        const accounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        const accountIds = accounts.map(a => a.id);
        if (accountIds.length === 0) return [];

        const startUtc = new Date(period.startDate);
        startUtc.setHours(0, 0, 0, 0);
        const endUtc = new Date(period.endDate);
        endUtc.setHours(23, 59, 59, 999);

        const includeAdjustingLines = includeAdjusting || reportType === 'adjusted' || reportType === 'post-closing';

        const journalTypes = includeAdjustingLines
            ? ['General', 'Adjusting']
            : ['General'];

        // Query lines seperti di C#: linesQuery.Where(...)
        const lines = await db
            .select({
                accountId: schema.journalEntryLines.accountId,
                debit: sql<number>`${schema.journalEntryLines.debit}::float`.as('debit'),
                credit: sql<number>`${schema.journalEntryLines.credit}::float`.as('credit'),
                journalType: schema.journalEntries.journalType
            })
            .from(schema.journalEntryLines)
            .innerJoin(
                schema.journalEntries,
                eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id)
            )
            .where(
                and(
                    inArray(schema.journalEntryLines.accountId, accountIds),
                    eq(schema.journalEntries.userId, userId),
                    sql`${schema.journalEntries.entryDate} >= ${startUtc} AND ${schema.journalEntries.entryDate} <= ${endUtc}`,
                    inArray(schema.journalEntries.journalType, journalTypes as any)
                )
            );

        const rows: TrialBalanceRow[] = [];

        for (const account of accounts) {
            const isPermanentAccount = isPermanent(account.type);

            // C#: if reportType == "post-closing" && !isPermanent -> continue
            if (reportType === 'post-closing' && !isPermanentAccount) {
                continue;
            }

            const accountLines = lines.filter(l => l.accountId === account.id);
            if (accountLines.length === 0) continue;

            const normalDebit = normalBalanceIsDebit(account.type);

            const totalDebitLines = accountLines.reduce((sum, l) => sum + (l.debit || 0), 0);
            const totalCreditLines = accountLines.reduce((sum, l) => sum + (l.credit || 0), 0);

            const netBalance = normalDebit
                ? totalDebitLines - totalCreditLines
                : totalCreditLines - totalDebitLines;

            let debit = 0;
            let credit = 0;

            if (totalDebitLines >= totalCreditLines) {
                debit = totalDebitLines - totalCreditLines;
            } else {
                credit = totalCreditLines - totalDebitLines;
            }

            rows.push({
                id: account.id,
                referenceNumber: String(account.referenceNumber),
                accountName: account.accountName,
                type: account.type,
                role: account.role,
                normalBalanceIsDebit: normalDebit,
                netBalance: Math.round(netBalance * 100) / 100,
                debit: Math.round(debit * 100) / 100,
                credit: Math.round(credit * 100) / 100
            } as any);
        }

        return rows;
    }

    /**
     * Backward compat untuk financial-report.service.ts yang pakai buildRows(userId, period, includeClosing)
     */
    async buildRows(
        userId: string,
        period: { startDate: Date; endDate: Date },
        includeClosing: boolean = false
    ): Promise<TrialBalanceRow[]> {
        // includeClosing true = adjusted (include Adjusting)
        return this.buildTrialBalanceRows(userId, period, includeClosing, includeClosing ? 'adjusted' : 'unadjusted');
    }

    /**
     * ComputeRetainedEarningsEndingAsync - 1:1 sama C#
     */
    async computeRetainedEarningsEnding(
        userId: string,
        period: { startDate: Date; endDate: Date }
    ): Promise<number> {
        const rows = await this.buildTrialBalanceRows(userId, period, true, 'adjusted');

        const totalRevenue = rows
            .filter(r => !(r as any).normalBalanceIsDebit && isTemporary(r.type))
            .reduce((sum, r) => sum + r.netBalance, 0);

        const totalExpense = rows
            .filter(r => (r as any).normalBalanceIsDebit && isTemporary(r.type))
            .reduce((sum, r) => sum + r.netBalance, 0);

        const netIncome = totalRevenue - totalExpense;

        const reRow = rows.find(r => r.role?.toLowerCase() === 'retainedearnings');
        const initialRE = reRow?.netBalance ?? 0;

        return Math.round((initialRE + netIncome) * 100) / 100;
    }
}

export const trialBalanceService = new TrialBalanceService();
