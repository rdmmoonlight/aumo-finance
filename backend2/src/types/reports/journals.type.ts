import { z } from 'zod';

// 1. Line - single source
export const closingJournalLineSchema = z.object({
    referenceNumber: z.string().default("0"),
    accountName: z.string(),
    debit: z.number().min(0),
    credit: z.number().min(0),
});

export type ClosingJournalLine = z.infer<typeof closingJournalLineSchema>;

// 2. Group - domain (yang dipakai di FE)
export const closingJournalEntryGroupSchema = z.object({
    title: z.string().default(''),
    description: z.string(),
    lines: z.array(closingJournalLineSchema).default([]),
});

export type ClosingJournalEntryGroup = z.infer<typeof closingJournalEntryGroupSchema>;

// 3. Group - API response (dari backend C# yang ada TotalDebit/Credit)
export const closingJournalEntryGroupApiResponseSchema = closingJournalEntryGroupSchema.extend({
    totalDebit: z.number(),
    totalCredit: z.number(),
});

export type ClosingJournalEntryGroupApiResponse = z.infer<
    typeof closingJournalEntryGroupApiResponseSchema
>;

// 4. Query
export const closingJournalQuerySchema = z.object({
    periodId: z.number().int().positive(),
});

export type ClosingJournalQuery = z.infer<typeof closingJournalQuerySchema>;

// 5. Helper class kalau butuh getter kayak di C#
export class ClosingJournalGroup implements ClosingJournalEntryGroup {
    title: string;
    description: string;
    lines: ClosingJournalLine[];

    constructor(data: ClosingJournalEntryGroup) {
        this.title = data.title;
        this.description = data.description;
        this.lines = data.lines;
    }

    get totalDebit() {
        return this.lines.reduce((sum, l) => sum + l.debit, 0);
    }

    get totalCredit() {
        return this.lines.reduce((sum, l) => sum + l.credit, 0);
    }

    toApiResponse(): ClosingJournalEntryGroupApiResponse {
        return {
            ...this,
            totalDebit: this.totalDebit,
            totalCredit: this.totalCredit,
        };
    }
}