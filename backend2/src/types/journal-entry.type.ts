import { z } from 'zod';

// === Line DTOs ===
export const journalEntryLineDtoSchema = z.object({
    accountId: z.number().int().min(1),
    lineDescription: z.string().optional().nullable(),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    lineOrder: z.number().int().optional()
});
export type JournalEntryLineDto = z.infer<typeof journalEntryLineDtoSchema>;

// === Create ===
export const createJournalEntryRequestSchema = z.object({
    journalType: z.string().optional().default('General'), // General | Adjusting
    entryDate: z.coerce.date(),
    createdAt: z.coerce.date().optional(), // dari device
    lines: z.array(journalEntryLineDtoSchema).min(2, 'Must have at least 2 lines')
});
export type CreateJournalEntryRequest = z.infer<typeof createJournalEntryRequestSchema>;

// === Update ===
export const updateJournalEntryRequestSchema = z.object({
    journalType: z.string().optional(),
    entryDate: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    lines: z.array(journalEntryLineDtoSchema).min(2)
});
export type UpdateJournalEntryRequest = z.infer<typeof updateJournalEntryRequestSchema>;

// === Responses ===
export interface JournalEntryLineResponse {
    id: string;
    accountId: number;
    lineDescription: string | null;
    debit: number;
    credit: number;
    lineOrder: number;
}

export interface JournalEntryResponse {
    id: number;
    transactionNumber: string;
    journalType: string;
    entryDate: Date;
    createdAt: Date;
    updatedAt: Date | null;
    isLocked: boolean;
    lines: JournalEntryLineResponse[];
}

export interface CreateJournalEntryResponse {
    entryId: number;
    transactionNumber: string;
    message: string;
}
