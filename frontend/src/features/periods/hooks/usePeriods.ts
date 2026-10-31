import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

// Types
export interface PeriodItem {
    id: number;
    periodName: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
    status: "Open" | "Closed" | string;
    isSelected: boolean;
}

export interface PeriodsOpenInfo {
    hasExistingPermanentAccounts: boolean;
    availableCashAndBankAccounts?: Array<{ id: number; name: string; code: string }>;
    availableRetainedEarningsAccounts?: Array<{ id: number; name: string; code: string }>;
}

export interface CreatePeriodRequest {
    month: number;
    year: number;
    setupMode: "LoadExisting" | "CreateNew";
    cashAccountId?: number | null;
    bankAccountId?: number | null;
    retainedEarningsAccountId?: number | null;
    cashAccountCode?: string;
    cashAccountName?: string;
    cashBalance?: number;
    bankAccountCode?: string;
    bankAccountName?: string;
    bankBalance?: number;
    retainedEarningsAccountCode?: string;
    retainedEarningsAccountName?: string;
}

const keys = {
    all: ["periods"] as const,
    list: () => [...keys.all, "list"] as const,
    openInfo: () => [...keys.all, "open-info"] as const,
};

export const periodsApi = {
    keys,

    // ===== QUERIES =====
    useGetPeriods: () => {
        return useQuery({
            queryKey: keys.list(),
            queryFn: async (): Promise<PeriodItem[]> => {
                const res = await apiClient.get<PeriodItem[] | { items: PeriodItem[] }>("/periods");
                const data = res.data;
                return Array.isArray(data) ? data : data.items;
            },
        });
    },

    useGetPeriodsOpenInfo: () => {
        return useQuery({
            queryKey: keys.openInfo(),
            queryFn: async (): Promise<PeriodsOpenInfo> => {
                const res = await apiClient.get<PeriodsOpenInfo>("/periods/open-info");
                return res.data;
            },
        });
    },

    // ===== MUTATIONS =====
    useCreatePeriod: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async (payload: { createPeriodRequest: CreatePeriodRequest }) => {
                await apiClient.post("/periods", payload.createPeriodRequest);
            },
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: keys.all });
            },
        });
    },

    useSelectPeriod: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async (payload: { id: number }) => {
                await apiClient.post(`/periods/${payload.id}/select`);
            },
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: keys.all });
            },
        });
    },

    useClearSelection: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async () => {
                await apiClient.post("/periods/clear-selection");
            },
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: keys.all });
            },
        });
    },

    useClosePeriod: () => {
        const qc = useQueryClient();
        return useMutation({
            mutationFn: async (payload: { id: number }) => {
                await apiClient.post(`/periods/${payload.id}/close`);
            },
            onSuccess: () => {
                qc.invalidateQueries({ queryKey: keys.all });
            },
        });
    },
};
