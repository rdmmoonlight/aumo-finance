import { z } from 'zod';

// 1. Sub DTOs
export const coaBalanceSchema = z.object({
    code: z.string(),
    name: z.string(),
    accountCode: z.string(),
    accountName: z.string(),
    category: z.string(),
    balance: z.number(),
});
export type CoaBalance = z.infer<typeof coaBalanceSchema>;
export type CoaBalanceDto = CoaBalance;

export const cashAccountItemSchema = z.object({
    // di C# object = string.Empty, jadi bisa number/string
    accountId: z.union([z.string(), z.number()]).transform(v => String(v)),
    referenceNumber: z.string(),
    accountName: z.string(),
    name: z.string().optional(), // alias AccountName
    isBank: z.boolean().optional().default(false),
    balance: z.number(),
});
export type CashAccountItem = z.infer<typeof cashAccountItemSchema>;
export type CashAccountItemDto = CashAccountItem;

export const expenseAccountItemSchema = z.object({
    accountId: z.union([z.string(), z.number()]).transform(v => String(v)),
    referenceNumber: z.string(),
    accountName: z.string(),
    name: z.string().optional(),
    amount: z.number().optional(), // alias Balance
    balance: z.number(),
});
export type ExpenseAccountItem = z.infer<typeof expenseAccountItemSchema>;
export type ExpenseAccountItemDto = ExpenseAccountItem;

export const chartTrendItemSchema = z.object({
    label: z.string(),
    period: z.string().optional(), // di C# ada, di FE lama nggak ada
    revenue: z.number(),
    expense: z.number().optional(), // alias Expenses
    expenses: z.number().optional(),
    net: z.number(),
}).transform(v => ({
    label: v.label,
    period: v.period ?? v.label,
    revenue: v.revenue,
    expense: v.expense ?? v.expenses ?? 0,
    net: v.net,
}));
export type ChartTrendItem = z.infer<typeof chartTrendItemSchema>;
export type ChartTrendItemDto = ChartTrendItem;

export const recentActivitySchema = z.object({
    title: z.string().optional(), // C# punya Title
    description: z.string(),
    timestamp: z.string().or(z.date()).optional(),
    date: z.string().or(z.date()).optional(), // alias FE lama
}).transform(v => ({
    id: v.title ?? v.description,
    title: v.title ?? v.description,
    description: v.description,
    date: v.date ?? v.timestamp ?? new Date().toISOString(),
}));
export type RecentActivity = z.infer<typeof recentActivitySchema>;
export type RecentActivityDto = RecentActivity;

// 2. Main Dashboard
export const dashboardDataSchema = z.object({
    success: z.boolean().default(true),
    hasPeriodSelected: z.boolean(),
    selectedPeriodName: z.string().default(''),
    isPeriodClosed: z.boolean(),

    totalAssets: z.number(),
    totalLiabilities: z.number(),
    totalEquity: z.number(),
    netIncome: z.number(),

    totalCashOnHand: z.number(),
    totalBankBalance: z.number(),

    totalAssetsMonthly: z.number(),
    totalAssetsAnnual: z.number(),
    totalCashOnHandMonthly: z.number(),
    totalCashOnHandAnnual: z.number(),
    totalBankBalanceMonthly: z.number(),
    totalBankBalanceAnnual: z.number(),
    totalLiabilitiesMonthly: z.number(),
    totalLiabilitiesAnnual: z.number(),

    totalAssetsCumulative: z.number(),
    totalCashOnHandCumulative: z.number(),
    totalBankBalanceCumulative: z.number(),
    totalLiabilitiesCumulative: z.number(),

    totalRevenue: z.number(),
    totalExpenses: z.number(),

    accounts: z.array(coaBalanceSchema).default([]), // ini yang hilang di FE lama kamu
    cashAccounts: z.array(cashAccountItemSchema).default([]),
    bankAccounts: z.array(cashAccountItemSchema).default([]),
    cashAccountsMonthly: z.array(cashAccountItemSchema).default([]),
    bankAccountsMonthly: z.array(cashAccountItemSchema).default([]),
    cashAccountsAnnual: z.array(cashAccountItemSchema).default([]),
    bankAccountsAnnual: z.array(cashAccountItemSchema).default([]),

    expenseAccountsList: z.array(expenseAccountItemSchema).default([]),
    chartTrend: z.array(chartTrendItemSchema).default([]),
    recentEntries: z.array(recentActivitySchema).default([]),
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type DashboardDataDto = DashboardData;

// 3. Query
export const dashboardQuerySchema = z.object({
    period: z.enum(['monthly', 'annual']).optional().default('monthly'),
});
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;