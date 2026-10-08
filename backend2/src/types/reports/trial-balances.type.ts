import { z } from 'zod';

// 1. Report type - jangan duplikat string literal
export const reportTypeValues = ['unadjusted', 'adjusted', 'post-closing'] as const;
export const reportTypeSchema = z.enum(reportTypeValues);
export type ReportType = z.infer<typeof reportTypeSchema>;

// 2. Row - gabungan C# (AccountId) + FE (id untuk key table)
export const trialBalanceRowSchema = z.object({
    id: z.number().int().optional(), // FE only, optional biar kompatibel sama C#
    accountId: z.number().int(),
    referenceNumber: z.string(),
    accountName: z.string(),
    type: z.string(),
    role: z.string().nullable().optional(),
    normalBalanceIsDebit: z.boolean().optional().default(true),
    netBalance: z.number(),
    debit: z.number(),
    credit: z.number(),
});

export type TrialBalanceRow = z.infer<typeof trialBalanceRowSchema>;
// alias biar kode lama yang pakai plural tidak error
export type TrialBalancesRow = TrialBalanceRow;

// 3. Query
export const trialBalancesQuerySchema = z.object({
    periodId: z.number().int().positive(),
    includeAdjusting: z.boolean().optional().default(false),
    reportType: reportTypeSchema.optional().default('unadjusted'),
});

export type TrialBalancesQuery = z.infer<typeof trialBalancesQuerySchema>;