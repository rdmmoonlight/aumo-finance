import type { ClosingJournalEntryGroup } from '../types/closing-journal.type.js';
import { financialReportsService } from './financial-reports.service.js';
import { trialBalancesService } from './trial-balances.service.js';

// Pengganti IJournalService / JournalService C#
// Build closing journal groups untuk proses tutup buku akhir periode

export class JournalsService {
    async buildClosingJournalGroups(
        userId: string,
        period: { startDate: Date; endDate: Date }
    ): Promise<ClosingJournalEntryGroup[]> {
        // C# : TrialBalanceController.BuildTrialBalanceRowsAsync(db, userId, period, true)
        const rows = await trialBalancesService.buildRows(userId, period, true);
        const incomeStatement = financialReportsService.buildIncomeStatement(rows, period);

        const reAccountName = rows.find(r => r.role === 'RetainedEarnings')?.accountName ?? 'Retained Earnings';
        const incomeSummaryName = 'Income Summary';

        const groups: ClosingJournalEntryGroup[] = [];

        const incomeRows = rows.filter(
            r => (r.type === 'OperatingIncome' || r.type === 'OtherIncome') && r.netBalance !== 0
        );
        const expenseRows = rows.filter(
            r => (r.type === 'OperatingExpenses' || r.type === 'OtherExpenses') && r.netBalance !== 0
        );

        // BLOCK 1: Closing Revenues to Income Summary
        // Jurnal: Debit Revenue, Credit Income Summary
        if (incomeRows.length > 0) {
            const group1: ClosingJournalEntryGroup = {
                description: 'Closing Revenue Accounts to Income Summary',
                lines: []
            };

            for (const r of incomeRows) {
                group1.lines.push({
                    referenceNumber: r.referenceNumber || '0',
                    accountName: r.accountName,
                    debit: Math.round(r.netBalance * 100) / 100,
                    credit: 0
                });
            }

            group1.lines.push({
                referenceNumber: '0',
                accountName: incomeSummaryName,
                debit: 0,
                credit: Math.round(incomeRows.reduce((sum, r) => sum + r.netBalance, 0) * 100) / 100
            });

            groups.push(group1);
        }

        // BLOCK 2: Closing Expenses to Income Summary
        // Jurnal: Debit Income Summary, Credit Expense
        if (expenseRows.length > 0) {
            const group2: ClosingJournalEntryGroup = {
                description: 'Closing Expense Accounts to Income Summary',
                lines: []
            };

            group2.lines.push({
                referenceNumber: '0',
                accountName: incomeSummaryName,
                debit: Math.round(expenseRows.reduce((sum, r) => sum + r.netBalance, 0) * 100) / 100,
                credit: 0
            });

            for (const r of expenseRows) {
                group2.lines.push({
                    referenceNumber: r.referenceNumber || '0',
                    accountName: r.accountName,
                    debit: 0,
                    credit: Math.round(r.netBalance * 100) / 100
                });
            }

            groups.push(group2);
        }

        // BLOCK 3: Closing Income Summary to Retained Earnings
        // Kalau Net Income > 0 (laba): Debit Income Summary, Credit Retained Earnings
        // Kalau Net Loss < 0 (rugi): Debit Retained Earnings, Credit Income Summary
        if (incomeStatement.netIncome !== 0) {
            const group3: ClosingJournalEntryGroup = {
                description: 'Closing Income Summary to Retained Earnings',
                lines: []
            };

            if (incomeStatement.netIncome > 0) {
                group3.lines.push({
                    referenceNumber: '0',
                    accountName: incomeSummaryName,
                    debit: Math.round(incomeStatement.netIncome * 100) / 100,
                    credit: 0
                });
                group3.lines.push({
                    referenceNumber: '0',
                    accountName: reAccountName,
                    debit: 0,
                    credit: Math.round(incomeStatement.netIncome * 100) / 100
                });
            } else {
                const netLoss = Math.abs(incomeStatement.netIncome);
                group3.lines.push({
                    referenceNumber: '0',
                    accountName: reAccountName,
                    debit: Math.round(netLoss * 100) / 100,
                    credit: 0
                });
                group3.lines.push({
                    referenceNumber: '0',
                    accountName: incomeSummaryName,
                    debit: 0,
                    credit: Math.round(netLoss * 100) / 100
                });
            }

            groups.push(group3);
        }

        return groups;
    }

    /**
     * Helper untuk eksekusi closing entries beneran (buat journal entries di DB)
     * Optional - kalau kamu mau langsung post closing journals
     */
    async executeClosing(
        userId: string,
        period: { startDate: Date; endDate: Date; id: number },
        transactionNumberService: { generate: (userId: string, type: string, date: Date) => Promise<string> },
        db: {
            insertJournalEntry: (data: any) => Promise<any>;
            insertJournalLines: (lines: any[]) => Promise<void>;
        }
    ) {
        const groups = await this.buildClosingJournalGroups(userId, period);

        // Untuk tiap group, buat 1 journal entry
        const results = [];
        for (const group of groups) {
            const txNumber = await transactionNumberService.generate(userId, 'Closing', period.endDate);
            // ... insert logic bisa pakai journalEntryService.create tapi dengan type Closing
            results.push({ transactionNumber: txNumber, description: group.description, lines: group.lines });
        }

        return results;
    }
}

export const journalsService = new JournalsService();
