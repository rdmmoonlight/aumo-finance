import {
    deleteApiV1JournalEntryDeleteById,
    getApiV1JournalEntryById,
    getApiV1JournalEntryNextTransactionNumber,
    getApiV1JournalEntrySearchDescriptions,
    postApiV1JournalEntryCreate,
    putApiV1JournalEntryEditById,
} from "@/lib/generated";
import type {
    CreateJournalEntryRequest,
    JournalEntryLineDto,
    UpdateJournalEntryRequest,
} from "@/lib/generated/types.gen";
import { dashboardKeys } from "@/features/dashboard/api/dashboard.api";
import { reportsKeys } from "@/features/reports/api/reports.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export type {
    CreateJournalEntryRequest,
    JournalEntryLineDto,
    UpdateJournalEntryRequest,
};

export interface EditJournalEntryArg {
    id: number;
    body: UpdateJournalEntryRequest;
}

export interface SearchDescriptionsParams {
    q?: string;
}

export interface NextTransactionNumberParams {
    journalType?: string;
    entryDate?: string;
}

// --- Query keys ---
export const journalEntryKeys = {
    all: ["journal-entry"] as const,
    detail: (id: number) => ["journal-entry", "detail", id] as const,
    descriptions: (params?: SearchDescriptionsParams) =>
        ["journal-entry", "descriptions", params ?? {}] as const,
    nextNumber: (params?: NextTransactionNumberParams) =>
        ["journal-entry", "next-number", params ?? {}] as const,
};

// --- Fungsi API murni ---
export async function getJournalEntryByIdApi(id: number, signal?: AbortSignal) {
    const { data } = await getApiV1JournalEntryById({
        path: { id },
        signal,
        throwOnError: true,
    });
    return data;
}

export async function createJournalEntryApi(body: CreateJournalEntryRequest) {
    const { data } = await postApiV1JournalEntryCreate({
        body,
        throwOnError: true,
    });
    return data;
}

export async function editJournalEntryApi({ id, body }: EditJournalEntryArg) {
    const { data } = await putApiV1JournalEntryEditById({
        path: { id },
        body,
        throwOnError: true,
    });
    return data;
}

export async function deleteJournalEntryApi(id: number) {
    const { data } = await deleteApiV1JournalEntryDeleteById({
        path: { id },
        throwOnError: true,
    });
    return data;
}

export async function searchDescriptionsApi(
    params?: SearchDescriptionsParams,
    signal?: AbortSignal,
) {
    const { data } = await getApiV1JournalEntrySearchDescriptions({
        query: { Q: params?.q },
        signal,
        throwOnError: true,
    });
    return data;
}

export async function getNextTransactionNumberApi(
    params?: NextTransactionNumberParams,
    signal?: AbortSignal,
) {
    const { data } = await getApiV1JournalEntryNextTransactionNumber({
        query: {
            JournalType: params?.journalType,
            EntryDate: params?.entryDate,
        },
        signal,
        throwOnError: true,
    });
    return data;
}

// --- Composables ---
// Mutasi jurnal mengubah laporan dan dashboard, sehingga ikut di-invalidate
function useInvalidateAfterJournalChange() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: journalEntryKeys.all });
        queryClient.invalidateQueries({ queryKey: reportsKeys.all });
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };
}

export function useGetJournalEntryByIdQuery(
    id: MaybeRefOrGetter<number | undefined>,
) {
    return useQuery({
        queryKey: computed(() => journalEntryKeys.detail(toValue(id) ?? -1)),
        queryFn: ({ signal }) =>
            getJournalEntryByIdApi(toValue(id) as number, signal),
        enabled: computed(() => toValue(id) !== undefined),
    });
}

export function useCreateJournalEntryMutation() {
    const invalidate = useInvalidateAfterJournalChange();
    return useMutation({
        mutationFn: createJournalEntryApi,
        onSuccess: invalidate,
    });
}

export function useEditJournalEntryMutation() {
    const invalidate = useInvalidateAfterJournalChange();
    return useMutation({
        mutationFn: editJournalEntryApi,
        onSuccess: invalidate,
    });
}

export function useDeleteJournalEntryMutation() {
    const invalidate = useInvalidateAfterJournalChange();
    return useMutation({
        mutationFn: deleteJournalEntryApi,
        onSuccess: invalidate,
    });
}

export function useSearchDescriptionsQuery(
    params?: MaybeRefOrGetter<SearchDescriptionsParams | undefined>,
) {
    return useQuery({
        queryKey: computed(() => journalEntryKeys.descriptions(toValue(params))),
        queryFn: ({ signal }) => searchDescriptionsApi(toValue(params), signal),
    });
}

export function useGetNextTransactionNumberQuery(
    params?: MaybeRefOrGetter<NextTransactionNumberParams | undefined>,
) {
    return useQuery({
        queryKey: computed(() => journalEntryKeys.nextNumber(toValue(params))),
        queryFn: ({ signal }) =>
            getNextTransactionNumberApi(toValue(params), signal),
    });
}
