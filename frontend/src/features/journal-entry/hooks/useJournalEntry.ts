import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

// --- Types ---
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

// --- Query Keys ---
export const journalEntryKeys = {
    all: ["journal-entry"] as const,
    lists: () => [...journalEntryKeys.all, "list"] as const,
    detail: (id: number) => [...journalEntryKeys.all, "detail", id] as const,
    searchDescriptions: (params?: SearchDescriptionsArg) =>
        [...journalEntryKeys.all, "search-descriptions", params ?? {}] as const,
    nextNumber: (params?: NextTransactionNumberArg) =>
        [...journalEntryKeys.all, "next-transaction-number", params ?? {}] as const,
};

// --- Queries ---

export function useGetJournalEntryById(id: number) {
    return useQuery({
        queryKey: journalEntryKeys.detail(id),
        queryFn: async () => {
            const res = await apiClient.get(`/journal-entry/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useSearchDescriptions(params?: SearchDescriptionsArg) {
    return useQuery({
        queryKey: journalEntryKeys.searchDescriptions(params),
        queryFn: async () => {
            const res = await apiClient.get("/journal-entry/search-descriptions", {
                params: params ? { q: params.q } : undefined,
            });
            return res.data;
        },
        // optional: jangan fetch kalau q kosong, biar gak spam
        enabled: params?.q ? params.q.length > 0 : true,
    });
}

export function useGetNextTransactionNumber(params?: NextTransactionNumberArg) {
    return useQuery({
        queryKey: journalEntryKeys.nextNumber(params),
        queryFn: async () => {
            const res = await apiClient.get("/journal-entry/next-transaction-number", {
                params: params
                    ? {
                        journalType: params.journalType,
                        entryDate: params.entryDate,
                    }
                    : undefined,
            });
            return res.data;
        },
        enabled: !!params?.journalType,
    });
}

// --- Mutations ---

export function useCreateJournalEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateJournalEntryRequest) => {
            const res = await apiClient.post("/journal-entry/create", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: journalEntryKeys.all });
        },
    });
}

export function useEditJournalEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: EditJournalEntryArg) => {
            const res = await apiClient.put(`/journal-entry/edit/${id}`, body);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: journalEntryKeys.all });
            qc.invalidateQueries({ queryKey: journalEntryKeys.detail(variables.id) });
        },
    });
}

export function useDeleteJournalEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await apiClient.delete(`/journal-entry/delete/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: journalEntryKeys.all });
        },
    });
}
