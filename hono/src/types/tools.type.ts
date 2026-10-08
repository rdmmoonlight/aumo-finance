import { z } from 'zod';

// 1. Market - yang hilang di FE lama
export const marketDetailSchema = z.object({
    price: z.number(),
    percent: z.number(),
    isUp: z.boolean(),
});
export type MarketDetail = z.infer<typeof marketDetailSchema>;

export const marketDataResponseSchema = z.object({
    success: z.boolean(),
    usd: marketDetailSchema.nullable().optional(),
    ihsg: marketDetailSchema.nullable().optional(),
    biRate: z.string().nullable().optional(),
});
export type MarketDataResponse = z.infer<typeof marketDataResponseSchema>;

// 2. Journal Line - canonical
export const journalLineDtoSchema = z.object({
    refNumber: z.number().int(),
    accountName: z.string(),
    description: z.string().optional().default(''),
    debit: z.number().nullable().optional(),
    credit: z.number().nullable().optional(),
});
export type JournalLineDto = z.infer<typeof journalLineDtoSchema>;
export type JournalLineImportDto = JournalLineDto; // alias, isinya sama

// 3. Journal Transaction
export const journalTransactionDtoSchema = z.object({
    transactionNumber: z.string(),
    date: z.string(), // yyyy-MM-dd
    journalType: z.string(), // General / Adjusting / GJ / AJ
    lines: z.array(journalLineDtoSchema).default([]),
});
export type JournalTransactionDto = z.infer<typeof journalTransactionDtoSchema>;

export const journalTransactionImportDtoSchema = z.object({
    date: z.string(), // raw dari excel
    journalType: z.string(),
    lines: z.array(journalLineDtoSchema).default([]),
});
export type JournalTransactionImportDto = z.infer<typeof journalTransactionImportDtoSchema>;

// 4. Mapping
export const accountMappingStatusSchema = z.enum([
    'EXACT_MATCH',
    'REALLOCATED_NAME',
    'REALLOCATED_REF',
    'UNMAPPED',
]);
export const accountMappingDetailSchema = z.object({
    excelRef: z.number().int(),
    excelAccountName: z.string(),
    mappedRef: z.number().int(),
    mappedAccountName: z.string(),
    status: accountMappingStatusSchema.or(z.string()), // C# string bebas
    reason: z.string().default(''),
});
export type AccountMappingDetail = z.infer<typeof accountMappingDetailSchema>;
export type AccountMappingDetailDto = AccountMappingDetail;

// 5. Preview
export const previewSummarySchema = z.object({
    totalUniqueAccounts: z.number().int(),
    exactMatchCount: z.number().int(),
    reallocatedCount: z.number().int(),
    unmappedCount: z.number().int(),
    isPerfectMatch: z.boolean(),
});
export type PreviewSummary = z.infer<typeof previewSummarySchema>;

export const previewJournalImportSchema = z.object({
    transactions: z.array(journalTransactionDtoSchema).default([]),
    accountMappings: z.array(accountMappingDetailSchema).default([]),
    summary: previewSummarySchema,
});
export type PreviewJournalImport = z.infer<typeof previewJournalImportSchema>;

// 6. Import Request / Result
export const journalImportRequestSchema = z.object({
    targetYear: z.number().int().min(2000).max(2100),
    targetMonth: z.number().int().min(1).max(12),
    transactions: z.array(journalTransactionImportDtoSchema).default([]),
    customMappings: z.array(accountMappingDetailSchema).optional(),
});
export type JournalImportRequest = z.infer<typeof journalImportRequestSchema>;
export type JournalImportRequestDto = JournalImportRequest;

export const importJournalResultSchema = z.object({
    message: z.string(),
    importedEntriesCount: z.number().int(),
});
export type ImportJournalResult = z.infer<typeof importJournalResultSchema>;