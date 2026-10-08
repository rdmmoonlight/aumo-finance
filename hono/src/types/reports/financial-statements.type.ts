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

export type IncomeStatementLineApiResponse = {
    referenceNumber: string;
    accountName: string;
    amount: number;
};

export type IncomeStatementApiResponse = {
    periodName: string;
    startDate: string; // ISO date
    endDate: string;
    asOfDate: string;
    totalRevenues: number;
    totalExpenses: number;
    totalRevenue: number;
    totalOperatingExpenses: number;
    operatingIncome: number;
    otherIncome: IncomeStatementLineApiResponse[];
    totalOtherIncome: number;
    otherExpenses: IncomeStatementLineApiResponse[];
    totalOtherExpenses: number;
    netIncome: number;
    revenues: IncomeStatementLineApiResponse[];
    expenses: IncomeStatementLineApiResponse[];
    operatingExpenses: IncomeStatementLineApiResponse[];
};

export type RetainedEarningsApiResponse = {
    periodName: string;
    accountName: string;
    startDate?: string | null;
    endDate?: string | null;
    beginningBalance: number;
    endingBalance: number;
    netIncome: number;
    dividends: number;
};

export type StatementOfCashFlowLineResponse = {
    activityType: string;
    description: string;
    amount: number;
};

export type FinancialPositionLineApiResponse = {
    referenceNumber: string;
    accountName: string;
    amount: number;
};

export type StatementOfFinancialPositionApiResponse = {
    periodName: string;
    asOfDate: string;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    equityExcludingRetainedEarnings: FinancialPositionLineApiResponse[];
    retainedEarningsEnding: number;
    isPostClosing: boolean;
    isBalanced: boolean;
    assets: FinancialPositionLineApiResponse[];
    liabilities: FinancialPositionLineApiResponse[];
    equity: FinancialPositionLineApiResponse[];
};

// Helper lines
export type CashFlowLine = {
    description: string;
    amount: number;
};