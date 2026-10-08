import { z } from 'zod';

export interface ClosingJournalLine {
    referenceNumber: string;
    accountName: string;
    debit: number;
    credit: number;
}

export interface ClosingJournalEntryGroup {
    description: string;
    lines: ClosingJournalLine[];
}

export const closingJournalQuerySchema = z.object({
    periodId: z.number().int()
});
