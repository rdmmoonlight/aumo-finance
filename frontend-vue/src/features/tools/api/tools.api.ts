import {
    getApiV1ToolsDownloadJournalTemplate,
    postApiV1ToolsImportJournalEntries,
    postApiV1ToolsPreviewJournalImport,
} from "@/lib/generated";
import type {
    AccountMappingDetailDto,
    JournalImportRequestDto,
    JournalLineDto,
    JournalTransactionDto,
} from "@/lib/generated/types.gen";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

export type {
    AccountMappingDetailDto,
    JournalImportRequestDto,
    JournalLineDto,
    JournalTransactionDto,
};

// --- Query keys ---
export const toolsKeys = {
    all: ["tools"] as const,
};

// --- Fungsi API murni ---
export async function downloadJournalTemplateApi() {
    const { data } = await getApiV1ToolsDownloadJournalTemplate({
        throwOnError: true,
    });
    return data;
}

export async function previewJournalImportApi(body: JournalImportRequestDto) {
    const { data } = await postApiV1ToolsPreviewJournalImport({
        body,
        throwOnError: true,
    });
    return data;
}

export async function importJournalEntriesApi(body: JournalImportRequestDto) {
    const { data } = await postApiV1ToolsImportJournalEntries({
        body,
        throwOnError: true,
    });
    return data;
}

// --- Composables ---
// Unduh template adalah aksi (memicu berkas), sehingga dibuat sebagai mutation
export function useDownloadJournalTemplateMutation() {
    return useMutation({ mutationFn: downloadJournalTemplateApi });
}

export function usePreviewJournalImportMutation() {
    return useMutation({ mutationFn: previewJournalImportApi });
}

export function useImportJournalEntriesMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: importJournalEntriesApi,
        onSuccess: () => {
            // Impor jurnal mengubah jurnal, laporan, dan dashboard sekaligus
            queryClient.invalidateQueries();
        },
    });
}
