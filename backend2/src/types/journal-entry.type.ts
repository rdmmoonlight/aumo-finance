import { z } from 'zod';

// 1. Base Line - canonical untuk semua request
export const journalEntryLineDtoSchema = z.object({
    accountId: z.number().int().min(1),
    lineDescription: z.string().nullable().optional().default(''),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    lineOrder: z.number().int().default(0),
});
export type JournalEntryLineDto = z.infer<typeof journalEntryLineDtoSchema>;
// alias C# yang duplikat
export type JournalEntryLineRequest = JournalEntryLineDto;
export type CreateJournalEntryLineRequest = JournalEntryLineDto;
export const journalEntryLineRequestSchema = journalEntryLineDtoSchema;
export const createJournalEntryLineRequestSchema = journalEntryLineDtoSchema;

// 2. Summary Dto (yang hilang di FE lama)
export const journalEntryDtoSchema = z.object({
    date: z.coerce.date(),
    totalDebit: z.number(),
    totalCredit: z.number(),
});
export type JournalEntryDto = z.infer<typeof journalEntryDtoSchema>;

// 3. Line Response
export const journalEntryLineResponseSchema = z.object({
    id: z.union([z.number().int(), z.string()]).transform(v => Number(v)), // C# int, FE lama string
    accountId: z.number().int(),
    lineDescription: z.string().nullable().optional(),
    debit: z.number(),
    credit: z.number(),
    lineOrder: z.number().int(),
});
export type JournalEntryLineResponse = z.infer<typeof journalEntryLineResponseSchema>;
export type JournalEntryLineResponseDto = JournalEntryLineResponse;

// 4. Entry Response
export const journalEntryResponseSchema = z.object({
    id: z.number().int(),
    transactionNumber: z.string(),
    journalType: z.string(),
    entryDate: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullable().optional(),
    isLocked: z.boolean().default(false),
    lines: z.array(journalEntryLineResponseSchema).default([]),
});
export type JournalEntryResponse = z.infer<typeof journalEntryResponseSchema>;
export type JournalEntryResponseDto = JournalEntryResponse;

// 5. Create Request
export const createJournalEntryRequestSchema = z.object({
    journalType: z.string().default('General'),
    entryDate: z.coerce.date(),
    createdAt: z.coerce.date().optional(),
    lines: z.array(journalEntryLineDtoSchema).min(2, 'Must have at least 2 lines'),
});
export type CreateJournalEntryRequest = z.infer<typeof createJournalEntryRequestSchema>;

// 6. Create Response
export const createJournalEntryResponseSchema = z.object({
    entryId: z.number().int(),
    transactionNumber: z.string(),
    message: z.string().default(''),
});
export type CreateJournalEntryResponse = z.infer<typeof createJournalEntryResponseSchema>;
export type CreateJournalEntryResponseDto = CreateJournalEntryResponse;

// 7. Update Request
export const updateJournalEntryRequestSchema = z.object({
    journalType: z.string().default(''),
    entryDate: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    lines: z.array(journalEntryLineDtoSchema).min(2),
});
export type UpdateJournalEntryRequest = z.infer<typeof updateJournalEntryRequestSchema>;