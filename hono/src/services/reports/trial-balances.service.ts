import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
import { isPermanent, isTemporary, normalBalanceIsDebit } from '../lib/account-classification.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import type { TrialBalanceRow } from '../types/trial-balance.type.js';

export type ReportType = 'unadjusted' | 'adjusted' | 'post-closing';

export class TrialBalanceService {
    /**
     * BuildTrialBalanceRows - Membaca langsung dari GL Permanent & Temporary
     */
    async buildTrialBalanceRows(
        userId: string,
        period: { startDate: Date; endDate: Date; periodId?: number },
        includeAdjusting: boolean = false,
        reportType: ReportType = 'unadjusted'
    ): Promise<TrialBalanceRow[]> {
        // 1. Ambil seluruh akun aktif milik user
        const accounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        if (accounts.length === 0) return [];

        const startUtc = new Date(period.startDate);
        startUtc.setHours(0, 0, 0, 0);
        const endUtc = new Date(period.endDate);
        endUtc.setHours(23, 59, 59, 999);

        // 2. Query dari GL Permanent (Akun Riil)
        const permLines = await db
            .select({
                accountId: schema.generalLedgerPermanentAccounts.accountId,
                debit: sql<number>`COALESCE(${schema.generalLedgerPermanentAccounts.debit}, 0)::float`,
                credit: sql<number>`COALESCE(${schema.generalLedgerPermanentAccounts.credit}, 0)::float`,
            })
            .from(schema.generalLedgerPermanentAccounts)
            .where(
                and(
                    eq(schema.generalLedgerPermanentAccounts.userId, userId),
                    gte(schema.generalLedgerPermanentAccounts.entryDate, startUtc),
                    lte(schema.generalLedgerPermanentAccounts.entryDate, endUtc)
                )
            );

        // 3. Query dari GL Temporary (Akun Nominal) - Omit jika Post-Closing
        let tempLines: typeof permLines = [];
        if (reportType !== 'post-closing') {
            tempLines = await db
                .select({
                    accountId: schema.generalLedgerTemporaryAccounts.accountId,
                    debit: sql<number>`COALESCE(${schema.generalLedgerTemporaryAccounts.debit}, 0)::float`,
                    credit: sql<number>`COALESCE(${schema.generalLedgerTemporaryAccounts.credit}, 0)::float`,
                })
                .from(schema.generalLedgerTemporaryAccounts)
                .where(
                    and(
                        eq(schema.generalLedgerTemporaryAccounts.userId, userId),
                        gte(schema.generalLedgerTemporaryAccounts.entryDate, startUtc),
                        lte(schema.generalLedgerTemporaryAccounts.entryDate, endUtc)
                    )
                );
        }

        // Gabungkan mutasi dari kedua GL
        const allLines = [...permLines, ...tempLines];

        // Grouping total Debit & Credit per AccountId
        const accountTotals = new Map<number, { debit: number; credit: number }>();
        for (const line of allLines) {
            const current = accountTotals.get(line.accountId) || { debit: 0, credit: 0 };
            accountTotals.set(line.accountId, {
                debit: current.debit + line.debit,
                credit: current.credit + line.credit,
            });
        }

        const rows: TrialBalanceRow[] = [];

        // 4. Kalkulasi per Akun
        for (const account of accounts) {
            const isPermanentAccount = isPermanent(account.type);

            // Jika Post-Closing, lewati akun temporer
            if (reportType === 'post-closing' && !isPermanentAccount) {
                continue;
            }

            const totals = accountTotals.get(account.id) || { debit: 0, credit: 0 };
            const normalDebit = normalBalanceIsDebit(account.type);

            const netDebitCredit = totals.debit - totals.credit;

            let debit = 0;
            let credit = 0;

            if (netDebitCredit > 0) {
                debit = netDebitCredit;
            } else if (netDebitCredit < 0) {
                credit = Math.abs(netDebitCredit);
            }

            // Net balance berdasarkan saldo normal akun
            const netBalance = normalDebit ? (debit - credit) : (credit - debit);

            rows.push({
                id: account.id,
                referenceNumber: String(account.referenceNumber),
                accountName: account.accountName,
                type: account.type,
                role: account.role,
                normalBalanceIsDebit: normalDebit,
                netBalance: Math.round(netBalance * 100) / 100,
                debit: Math.round(debit * 100) / 100,
                credit: Math.round(credit * 100) / 100,
            } as any);
        }

        return rows;
    }

    /**
     * Backward compatibility
     */
    async buildRows(
        userId: string,
        period: { startDate: Date; endDate: Date },
        includeClosing: boolean = false
    ): Promise<TrialBalanceRow[]> {
        return this.buildTrialBalanceRows(userId, period, includeClosing, includeClosing ? 'adjusted' : 'unadjusted');
    }

    /**
     * ComputeRetainedEarningsEndingAsync
     */
    async computeRetainedEarningsEnding(
        userId: string,
        period: { startDate: Date; endDate: Date }
    ): Promise<number> {
        const rows = await this.buildTrialBalanceRows(userId, period, true, 'adjusted');

        // Total Pendapatan (Akun Temporer Kredit)
        const totalRevenue = rows
            .filter(r => isTemporary(r.type) && !r.normalBalanceIsDebit)
            .reduce((sum, r) => sum + (r.credit - r.debit), 0);

        // Total Beban (Akun Temporer Debit)
        const totalExpense = rows
            .filter(r => isTemporary(r.type) && r.normalBalanceIsDebit)
            .reduce((sum, r) => sum + (r.debit - r.credit), 0);

        const netIncome = totalRevenue - totalExpense;

        const reRow = rows.find(r => r.role?.toLowerCase() === 'retainedearnings');
        const initialRE = reRow ? (reRow.normalBalanceIsDebit ? reRow.debit - reRow.credit : reRow.credit - reRow.debit) : 0;

        return Math.round((initialRE + netIncome) * 100) / 100;
    }
}

export const trialBalanceService = new TrialBalanceService();