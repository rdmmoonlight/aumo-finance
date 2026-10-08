import type {
    FinancialPositionLine,
    IncomeStatementLine,
    IncomeStatementResponse,
    RetainedEarningsResponse,
    StatementOfFinancialPositionResponse
} from '../types/financial-reports.type.js';
import type { TrialBalanceRow } from '../types/trial-balance.type.js';
import { trialBalanceService } from './trial-balance.service.js';

// Pengganti IFinancialReportService / FinancialReportService C#

export class FinancialReportsService {
    /**
     * Build Income Statement dari Trial Balance rows
     * C# BuildIncomeStatement - pure function, tidak ada DB call
     */
    buildIncomeStatement(rows: TrialBalanceRow[], period: { endDate: Date }): IncomeStatementResponse {
        const toLine = (r: TrialBalanceRow): IncomeStatementLine => ({
            referenceNumber: r.referenceNumber || '',
            accountName: r.accountName,
            amount: r.netBalance
        });

        const revenues = rows.filter(r => r.type === 'OperatingIncome').map(toLine);
        const operatingExpenses = rows.filter(r => r.type === 'OperatingExpenses').map(toLine);
        const otherIncome = rows.filter(r => r.type === 'OtherIncome').map(toLine);
        const otherExpenses = rows.filter(r => r.type === 'OtherExpenses').map(toLine);

        const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalOperatingExpenses = operatingExpenses.reduce((sum, e) => sum + e.amount, 0);
        const operatingIncome = totalRevenue - totalOperatingExpenses;

        const totalOtherIncome = otherIncome.reduce((sum, i) => sum + i.amount, 0);
        const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

        const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

        return {
            asOfDate: period.endDate,
            revenues,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            operatingExpenses,
            totalOperatingExpenses: Math.round(totalOperatingExpenses * 100) / 100,
            operatingIncome: Math.round(operatingIncome * 100) / 100,
            otherIncome,
            totalOtherIncome: Math.round(totalOtherIncome * 100) / 100,
            otherExpenses,
            totalOtherExpenses: Math.round(totalOtherExpenses * 100) / 100,
            netIncome: Math.round(netIncome * 100) / 100
        };
    }

    /**
     * Build Retained Earnings - butuh trial balance + income statement
     * C# BuildRetainedEarningsAsync
     */
    async buildRetainedEarnings(
        userId: string,
        period: { startDate: Date; endDate: Date }
    ): Promise<RetainedEarningsResponse> {
        // C# : TrialBalanceController.BuildTrialBalanceRowsAsync(db, userId, period, true)
        // Kita ganti dengan trialBalanceService.buildRows
        const rows = await trialBalanceService.buildRows(userId, period, true);
        const incomeStatement = this.buildIncomeStatement(rows, period);

        const reAccount = rows.find(r => r.role === 'RetainedEarnings');

        const beginningBalance = reAccount?.netBalance ?? 0;
        const netIncome = incomeStatement.netIncome;
        const dividends = 0; // TODO: kalau ada dividend tracking
        const endingBalance = beginningBalance + netIncome - dividends;

        return {
            accountName: reAccount?.accountName ?? 'Retained Earnings',
            startDate: period.startDate,
            endDate: period.endDate,
            beginningBalance: Math.round(beginningBalance * 100) / 100,
            netIncome: Math.round(netIncome * 100) / 100,
            dividends,
            endingBalance: Math.round(endingBalance * 100) / 100
        };
    }

    /**
     * Build Statement of Financial Position (Neraca)
     * C# BuildSofpAsync
     */
    async buildSofp(
        userId: string,
        period: { startDate: Date; endDate: Date },
        isPostClosing: boolean = false
    ): Promise<StatementOfFinancialPositionResponse> {
        const rows = await trialBalanceService.buildRows(userId, period, true);
        const re = await this.buildRetainedEarnings(userId, period);

        const toLine = (r: TrialBalanceRow): FinancialPositionLine => ({
            referenceNumber: r.referenceNumber || '',
            accountName: r.accountName || '',
            amount: r.netBalance
        });

        const assets = rows.filter(r => r.type === 'Assets' || r.type === 'Asset').map(toLine);
        const liabilities = rows.filter(r => r.type === 'Liabilities' || r.type === 'Liability').map(toLine);
        const equityExcludingRe = rows.filter(r => (r.type === 'Equity') && r.role !== 'RetainedEarnings').map(toLine);

        const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
        const totalEquityExcludingRe = equityExcludingRe.reduce((sum, e) => sum + e.amount, 0);
        const retainedEarningsEnding = re.endingBalance;

        const totalEquity = totalEquityExcludingRe + retainedEarningsEnding;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        const isBalanced = Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100 === 0;

        return {
            asOfDate: period.endDate,
            isPostClosing,
            assets,
            totalAssets: Math.round(totalAssets * 100) / 100,
            liabilities,
            totalLiabilities: Math.round(totalLiabilities * 100) / 100,
            equityExcludingRetainedEarnings: equityExcludingRe,
            retainedEarningsEnding: Math.round(retainedEarningsEnding * 100) / 100,
            totalEquity: Math.round(totalEquity * 100) / 100,
            totalLiabilitiesAndEquity: Math.round(totalLiabilitiesAndEquity * 100) / 100,
            isBalanced
        };
    }
}

export const financialReportsService = new FinancialReportsService();
