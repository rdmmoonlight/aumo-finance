// src/types/tools.ts atau src/api/dto/tools.dto.ts
export type JournalLineDto = {
    refNumber?: number | string;
    accountName?: string;
    description?: string;
    debit?: null | number | string;
    credit?: null | number | string;
};

export type JournalTransactionDto = {
    transactionNumber?: string;
    date?: string;
    journalType?: string;
    lines?: JournalLineDto[];
};

export type AccountMappingDetailDto = {
    excelRef?: number | string;
    excelAccountName?: string;
    mappedRef?: number | string;
    mappedAccountName?: string;
    status?: string;
    reason?: string;
};

export type JournalImportRequestDto = {
    targetYear?: number | string;
    targetMonth?: number | string;
    transactions?: JournalTransactionDto[];
    customMappings?: null | AccountMappingDetailDto[];
};

// sekalian definisiin response biar gak pake <T = unknown>
export type JournalPreviewResponseDto = {
    success?: boolean;
    message?: string;
    data?: JournalImportRequestDto | null;
};