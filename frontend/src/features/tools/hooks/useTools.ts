import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

// --- DTO & Type Definitions ---
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

// --- Query Keys ---
export const toolsKeys = {
    all: ["tools"] as const,
    journalTemplate: () => [...toolsKeys.all, "download-journal-template"] as const,
};

// --- Query ---

/**
 * GET /tools/download-journal-template
 * Biasanya return blob / file, jadi return data mentah
 */
export function useDownloadJournalTemplate() {
    return useQuery({
        queryKey: toolsKeys.journalTemplate(),
        queryFn: async () => {
            const res = await apiClient.get("/tools/download-journal-template");
            return res.data as Blob;
        },
        enabled: false, // biar gak auto download, trigger manual pakai refetch()
    });
}

// --- Mutations ---

export function usePreviewJournalImport() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: JournalImportRequestDto) => {
            const res = await apiClient.post("/tools/preview-journal-import", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: toolsKeys.all });
        },
    });
}

export function useImportJournalEntries() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: JournalImportRequestDto) => {
            const res = await apiClient.post("/tools/import-journal-entries", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: toolsKeys.all });
        },
    });
}
