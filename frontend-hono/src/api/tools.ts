// src/api/tools.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type { JournalImportRequestDto, JournalPreviewResponseDto } from "@/types/tools";

export function downloadJournalTemplate(): Promise<Blob> {
    return coreStore.fetchWithCache(
        "/tools/download-journal-template",
        () => apiClient("/tools/download-journal-template"),
        { ttl: 300000, tags: ["Tools"] }
    );
}

export async function previewJournalImport(
    payload: JournalImportRequestDto
): Promise<JournalPreviewResponseDto> {
    const result = await apiClient("/tools/preview-journal-import", {
        method: "POST",
        body: payload,
    });
    coreStore.invalidate(["Tools"]);
    return result as JournalPreviewResponseDto;
}

export async function importJournalEntries(
    payload: JournalImportRequestDto
): Promise<void> {
    const result = await apiClient("/tools/import-journal-entries", {
        method: "POST",
        body: payload,
    });
    coreStore.invalidate(["Tools"]);
    return result as void;
}