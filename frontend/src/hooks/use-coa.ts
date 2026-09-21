import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export interface ChartOfAccount {
  id: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  role: string;
  balance: number;
  isActive: boolean;
}

export interface CreateAccountPayload {
  referenceNumber: number;
  accountName: string;
  type: string;
  role?: string;
}

export function useChartOfAccounts() {
  const queryClient = useQueryClient();

  // 1. Fetch COA List
  const accountsQuery = useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/chart-of-accounts");
      const loaded: ChartOfAccount[] = data?.accounts || [];
      return loaded.sort((a, b) => a.referenceNumber - b.referenceNumber);
    },
  });

  // 2. Mutasi Create
  const createAccountMutation = useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      return await apiClient.post("/api/v1/chart-of-accounts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });

  // 3. Mutasi Edit/Update
  const updateAccountMutation = useMutation({
    mutationFn: async (account: ChartOfAccount) => {
      return await apiClient.put(
        `/api/v1/chart-of-accounts/${account.id}`,
        account
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });

  // 4. Mutasi Delete
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.delete(`/api/v1/chart-of-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
    },
  });

  return {
    accounts: accountsQuery.data || [],
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    createAccount: createAccountMutation,
    updateAccount: updateAccountMutation,
    deleteAccount: deleteAccountMutation,
  };
}