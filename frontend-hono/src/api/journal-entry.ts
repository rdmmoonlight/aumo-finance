// src/api/journal-entry.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    CreateJournalEntryRequest,
    EditJournalEntryArg,
    GetJournalEntryByIdArg,
    NextTransactionNumberArg,
    SearchDescriptionsArg
} from "@/types/journal-entry";

/**
 * GET /journal-entry/{id}
 */
export function getJournalEntryById({ id }: GetJournalEntryByIdArg): Promise<any> {
    const cacheKey = `/journal-entry/${id}`;
    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient(cacheKey),
        { ttl: 60000, tags: ["JournalEntry"] }
    );
}

/**
 * POST /journal-entry/create
 */
export async function createJournalEntry(body: CreateJournalEntryRequest): Promise<any> {
    const result = await apiClient("/journal-entry/create", {
        method: "POST",
        body,
    });
    coreStore.invalidate(["JournalEntry"]);
    return result;
}

/**
 * PUT /journal-entry/edit/{id}
 */
export async function editJournalEntry({ id, body }: EditJournalEntryArg): Promise<any> {
    const result = await apiClient(`/journal-entry/edit/${id}`, {
        method: "PUT",
        body,
    });
    coreStore.invalidate(["JournalEntry"]);
    return result;
}

/**
 * DELETE /journal-entry/delete/{id}
 */
export async function deleteJournalEntry(id: number): Promise<any> {
    const result = await apiClient(`/journal-entry/delete/${id}`, {
        method: "DELETE",
    });
    coreStore.invalidate(["JournalEntry"]);
    return result;
}

/**
 * GET /journal-entry/search-descriptions
 */
export function searchDescriptions(params?: SearchDescriptionsArg): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.q) {
        queryParams.set("q", params.q);
    }

    const queryString = queryParams.toString();
    const cacheKey = `/journal-entry/search-descriptions${queryString ? `?${queryString}` : ""}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient(cacheKey),
        { ttl: 30000, tags: ["JournalEntry"] }
    );
}

/**
 * GET /journal-entry/next-transaction-number
 */
export function getNextTransactionNumber(params?: NextTransactionNumberArg): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.journalType) {
        queryParams.set("journalType", params.journalType);
    }
    if (params?.entryDate) {
        queryParams.set("entryDate", params.entryDate);
    }

    const queryString = queryParams.toString();
    const cacheKey = `/journal-entry/next-transaction-number${queryString ? `?${queryString}` : ""}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient(cacheKey),
        { ttl: 10000, tags: ["JournalEntry"] }
    );
}