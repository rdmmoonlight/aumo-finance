import { z } from 'zod';

export interface IncomeStatementLine {
    referenceNumber: string;
    accountName: string;
    amount: number;
}

export interface IncomeStatementResponse {
    asOfDate: Date;
    revenues: IncomeStatementLine[];
    totalRevenue: number;
    operatingExpenses: IncomeStatementLine[];
    totalOperatingExpenses: number;
    operatingIncome: number;
    otherIncome: IncomeStatementLine[];
    totalOtherIncome: number;
    otherExpenses: IncomeStatementLine[];
    totalOtherExpenses: number;
    netIncome: number;
}

export interface RetainedEarningsResponse {
    accountName: string;
    startDate: Date;
    endDate: Date;
    beginningBalance: number;
    netIncome: number;
    dividends: number;
    endingBalance: number;
}

export interface FinancialPositionLine {
    referenceNumber: string;
    accountName: string;
    amount: number;
}

export interface StatementOfFinancialPositionResponse {
    asOfDate: Date;
    isPostClosing: boolean;
    assets: FinancialPositionLine[];
    totalAssets: number;
    liabilities: FinancialPositionLine[];
    totalLiabilities: number;
    equityExcludingRetainedEarnings: FinancialPositionLine[];
    retainedEarningsEnding: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
}

// Zod untuk request (kalau butuh validasi di route)
export const financialReportQuerySchema = z.object({
    periodId: z.number().int(),
    isPostClosing: z.boolean().optional().default(false)
});
