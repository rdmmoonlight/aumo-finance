import { and, asc, eq } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
import { isTemporary, normalBalanceIsDebit } from '../lib/account-classification.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import type { WorksheetRow } from '../types/worksheet.type.js';
import { trialBalanceService } from './trial-balance.service.js';

// Pengganti IWorksheetService / WorksheetService C#

export class WorksheetService {
    async buildWorksheetRows(
        userId: string,
        period: { startDate: Date; endDate: Date }
    ): Promise<WorksheetRow[]> {
        // C#: unadjusted = BuildTrialBalanceRowsAsync(includeAdjusting: false)
        //     adjusted = BuildTrialBalanceRowsAsync(includeAdjusting: true)
        const [unadjusted, adjusted] = await Promise.all([
            trialBalanceService.buildTrialBalanceRows(userId, period, false, 'unadjusted'),
            trialBalanceService.buildTrialBalanceRows(userId, period, true, 'adjusted')
        ]);

        const accounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            ),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        // Union accountIds dari unadjusted + adjusted
        const allAccountIds = Array.from(
            new Set([
                ...unadjusted.map(r => r.id),
                ...adjusted.map(r => r.id)
            ])
        );

        const worksheetRows: WorksheetRow[] = [];

        for (const accountId of allAccountIds) {
            const account = accounts.find(a => a.id === accountId);
            if (!account) continue;

            const u = unadjusted.find(r => r.id === accountId);
            const a = adjusted.find(r => r.id === accountId);

            const normalDebit = normalBalanceIsDebit(account.type);

            const uDebit = (u as any)?.debit ?? 0;
            const uCredit = (u as any)?.credit ?? 0;
            const aDebit = (a as any)?.debit ?? 0;
            const aCredit = (a as any)?.credit ?? 0;

            // adjNet = (aDebit - aCredit) - (uDebit - uCredit) — sama persis C#
            const adjNet = (aDebit - aCredit) - (uDebit - uCredit);

            const row: WorksheetRow = {
                accountId,
                referenceNumber: account.referenceNumber,
                accountName: account.accountName,
                type: account.type,
                normalBalanceIsDebit: normalDebit,
                unadjustedDebit: Math.round(uDebit * 100) / 100,
                unadjustedCredit: Math.round(uCredit * 100) / 100,
                adjustmentDebit: adjNet > 0 ? Math.round(adjNet * 100) / 100 : 0,
                adjustmentCredit: adjNet < 0 ? Math.round(-adjNet * 100) / 100 : 0,
                adjustedDebit: Math.round(aDebit * 100) / 100,
                adjustedCredit: Math.round(aCredit * 100) / 100
            };

            const isTemporaryAccount = isTemporary(account.type);

            if (isTemporaryAccount) {
                // Temporary -> masuk Income Statement columns
                row.incomeStatementDebit = Math.round(aDebit * 100) / 100;
                row.incomeStatementCredit = Math.round(aCredit * 100) / 100;
            } else {
                // Permanent -> masuk Financial Position columns
                row.financialPositionDebit = Math.round(aDebit * 100) / 100;
                row.financialPositionCredit = Math.round(aCredit * 100) / 100;
            }

            worksheetRows.push(row);
        }

        return worksheetRows.sort((a, b) => a.referenceNumber - b.referenceNumber);
    }
}

export const worksheetService = new WorksheetService();
