import { z } from 'zod';

export interface CashAccountItem {
    accountId: string;
    referenceNumber: string;
    accountName: string;
    balance: number;
    isBank: boolean;
}

export interface ExpenseAccountItem {
    accountId: string;
    referenceNumber: string;
    accountName: string;
    balance: number;
}

export interface ChartTrendItem {
    label: string;
    revenue: number;
    expense: number;
    net: number;
}

export interface RecentActivity {
    id: string;
    description: string;
    date: Date;
}

export interface DashboardData {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName: string;
    isPeriodClosed: boolean;

    totalAssets: number;
    totalCashOnHand: number;
    totalBankBalance: number;
    totalLiabilities: number;

    totalAssetsMonthly: number;
    totalAssetsAnnual: number;
    totalCashOnHandMonthly: number;
    totalCashOnHandAnnual: number;
    totalBankBalanceMonthly: number;
    totalBankBalanceAnnual: number;
    totalLiabilitiesMonthly: number;
    totalLiabilitiesAnnual: number;

    totalAssetsCumulative: number;
    totalCashOnHandCumulative: number;
    totalBankBalanceCumulative: number;
    totalLiabilitiesCumulative: number;

    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;

    cashAccounts: CashAccountItem[];
    bankAccounts: CashAccountItem[];
    cashAccountsMonthly: CashAccountItem[];
    bankAccountsMonthly: CashAccountItem[];
    cashAccountsAnnual: CashAccountItem[];
    bankAccountsAnnual: CashAccountItem[];

    expenseAccountsList: ExpenseAccountItem[];
    chartTrend: ChartTrendItem[];
    recentEntries: RecentActivity[];
}

export const dashboardQuerySchema = z.object({
    period: z.enum(['monthly', 'annual']).optional().default('monthly')
});
