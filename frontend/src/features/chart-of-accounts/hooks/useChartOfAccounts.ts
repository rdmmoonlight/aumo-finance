import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

// --- Types ---
export type CreateAccountRequest = {
    referenceNumber?: number | string;
    accountName?: string;
    type?: string;
    role?: string;
};

export type UpdateAccountRequest = {
    referenceNumber?: number | string;
    accountName?: string;
    type?: string;
    role?: string;
    isActive?: boolean;
};

export type GetChartOfAccountsArg = {
    search?: string;
    category?: string;
};

export type PutChartOfAccountsByIdArg = {
    id: number | string;
    updateAccountRequest: UpdateAccountRequest;
};

export type DeleteChartOfAccountsByIdArg = {
    id: number | string;
};

// --- Query Keys ---
export const chartOfAccountsKeys = {
    all: ["chart-of-accounts"] as const,
    lists: () => [...chartOfAccountsKeys.all, "list"] as const,
    list: (filters?: GetChartOfAccountsArg) =>
        [...chartOfAccountsKeys.lists(), filters ?? {}] as const,
};

// --- Query ---
export function useGetChartOfAccounts(filters?: GetChartOfAccountsArg) {
    return useQuery({
        queryKey: chartOfAccountsKeys.list(filters),
        queryFn: async () => {
            const res = await apiClient.get("/chart-of-accounts", {
                params: {
                    search: filters?.search || undefined,
                    category: filters?.category || undefined,
                },
            });
            return res.data;
        },
    });
}

// --- Mutations ---
export function useCreateChartOfAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateAccountRequest) => {
            const res = await apiClient.post("/chart-of-accounts", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: chartOfAccountsKeys.all });
        },
    });
}

export function useUpdateChartOfAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updateAccountRequest }: PutChartOfAccountsByIdArg) => {
            const res = await apiClient.put(`/chart-of-accounts/${id}`, updateAccountRequest);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: chartOfAccountsKeys.all });
        },
    });
}

export function useDeleteChartOfAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: DeleteChartOfAccountsByIdArg) => {
            const res = await apiClient.delete(`/chart-of-accounts/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: chartOfAccountsKeys.all });
        },
    });
}
