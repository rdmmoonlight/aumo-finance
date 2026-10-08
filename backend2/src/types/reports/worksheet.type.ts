import { z } from 'zod';

// 1. Canonical - yang dipakai di FE (tanpa alias)
export const worksheetRowSchema = z.object({
    accountId: z.number().int(),
    referenceNumber: z.number().int(),
    accountName: z.string(),
    type: z.string(),
    normalBalanceIsDebit: z.boolean(),

    // Unadjusted
    unadjustedDebit: z.number(),
    unadjustedCredit: z.number(),

    // Adjustments - canonical name: adjustment*
    adjustmentDebit: z.number(),
    adjustmentCredit: z.number(),

    // Adjusted
    adjustedDebit: z.number(),
    adjustedCredit: z.number(),

    // Income Statement & Financial Position - optional karena cuma salah satu yang kepakai per akun
    incomeStatementDebit: z.number().optional(),
    incomeStatementCredit: z.number().optional(),
    financialPositionDebit: z.number().optional(),
    financialPositionCredit: z.number().optional(),
});

export type WorksheetRow = z.infer<typeof worksheetRowSchema>;

// 2. API Response - terima alias lama dari backend biar kompatibel
export const worksheetRowApiResponseSchema = worksheetRowSchema.extend({
    // alias baru & lama jadi optional
    adjustingDebit: z.number().optional(),
    adjustingCredit: z.number().optional(),
    balanceSheetDebit: z.number().optional(),
    balanceSheetCredit: z.number().optional(),
});

export type WorksheetRowApiResponse = z.infer<typeof worksheetRowApiResponseSchema>;

// 3. Normalizer - ubah apapun dari API jadi canonical
export function normalizeWorksheetRow(row: WorksheetRowApiResponse): WorksheetRow {
    return {
        accountId: row.accountId,
        referenceNumber: row.referenceNumber,
        accountName: row.accountName,
        type: row.type,
        normalBalanceIsDebit: row.normalBalanceIsDebit,
        unadjustedDebit: row.unadjustedDebit,
        unadjustedCredit: row.unadjustedCredit,
        adjustmentDebit: row.adjustmentDebit ?? row.adjustingDebit ?? 0,
        adjustmentCredit: row.adjustmentCredit ?? row.adjustingCredit ?? 0,
        adjustedDebit: row.adjustedDebit,
        adjustedCredit: row.adjustedCredit,
        incomeStatementDebit: row.incomeStatementDebit,
        incomeStatementCredit: row.incomeStatementCredit,
        financialPositionDebit: row.financialPositionDebit ?? row.balanceSheetDebit,
        financialPositionCredit: row.financialPositionCredit ?? row.balanceSheetCredit,
    };
}

// 4. Query
export const worksheetQuerySchema = z.object({
    periodId: z.number().int().positive(),
});

export type WorksheetQuery = z.infer<typeof worksheetQuerySchema>;