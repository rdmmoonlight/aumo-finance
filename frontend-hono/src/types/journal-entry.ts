// src/types/journal-entry.ts

export interface JournalEntryLineDto {
    accountId?: number | string;
    lineDescription?: string;
    debit?: number | string;
    credit?: number | string;
    lineOrder?: number | string;
}

export interface CreateJournalEntryRequest {
    journalType?: string;
    entryDate?: string;
    createdAt?: string;
    lines?: JournalEntryLineDto[];
}

export interface UpdateJournalEntryRequest {
    transactionNumber?: string;
    journalType?: string;
    entryDate?: string;
    updatedAt?: string;
    lines?: JournalEntryLineDto[];
}

export interface GetJournalEntryByIdArg {
    id: number;
}

export interface EditJournalEntryArg {
    id: number;
    body: UpdateJournalEntryRequest;
}

export interface SearchDescriptionsArg {
    q?: string;
}

export interface NextTransactionNumberArg {
    journalType?: string;
    entryDate?: string;
}