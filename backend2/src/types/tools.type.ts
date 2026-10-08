import { z } from 'zod';

export interface JournalLineImportDto {
    refNumber: number;
    accountName: string;
    description?: string;
    debit?: number | null;
    credit?: number | null;
}

export interface JournalTransactionImportDto {
    date: string; // raw date string from excel
    journalType: string; // General / Adjusting / GJ / AJ
    lines: JournalLineImportDto[];
}

export interface AccountMappingDetail {
    excelRef: number;
    excelAccountName: string;
    mappedRef: number;
    mappedAccountName: string;
    status: 'EXACT_MATCH' | 'REALLOCATED_NAME' | 'REALLOCATED_REF' | 'UNMAPPED';
    reason: string;
}

export interface JournalLineDto {
    refNumber: number;
    accountName: string;
    description?: string;
    debit?: number | null;
    credit?: number | null;
}

export interface JournalTransactionDto {
    transactionNumber: string;
    date: string; // yyyy-MM-dd
    journalType: string;
    lines: JournalLineDto[];
}

export interface PreviewSummary {
    totalUniqueAccounts: number;
    exactMatchCount: number;
    reallocatedCount: number;
    unmappedCount: number;
    isPerfectMatch: boolean;
}

export interface PreviewJournalImport {
    transactions: JournalTransactionDto[];
    accountMappings: AccountMappingDetail[];
    summary: PreviewSummary;
}

export interface JournalImportRequest {
    targetYear: number;
    targetMonth: number;
    transactions: JournalTransactionImportDto[];
    customMappings?: AccountMappingDetail[];
}

export interface ImportJournalResult {
    message: string;
    importedEntriesCount: number;
}

export const journalImportRequestSchema = z.object({
    targetYear: z.number().int().min(2000).max(2100),
    targetMonth: z.number().int().min(1).max(12),
    transactions: z.array(z.object({
        date: z.string(),
        journalType: z.string(),
        lines: z.array(z.object({
            refNumber: z.number().int(),
            accountName: z.string(),
            description: z.string().optional(),
            debit: z.number().nullable().optional(),
            credit: z.number().nullable().optional()
        }))
    })),
    customMappings: z.array(z.object({
        excelRef: z.number().int(),
        excelAccountName: z.string(),
        mappedRef: z.number().int(),
        mappedAccountName: z.string().optional(),
        status: z.string().optional(),
        reason: z.string().optional()
    })).optional()
});
