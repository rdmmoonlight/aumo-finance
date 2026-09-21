import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export interface ChartOfAccountOption {
  id: number;
  referenceNumber: number;
  accountName: string;
}

export interface JournalEntryPayload {
  journalType: string;
  entryDate: string;
  lines: {
    accountId: number;
    lineDescription: string;
    debit: number;
    credit: number;
  }[];
}

// 1. Fetch Opsi Akun (COA)
export function useAccountOptions() {
  return useQuery({
    queryKey: ["chart-of-accounts-options"],
    queryFn: async () => {
      const { data: accRes } = await apiClient.get("/api/v1/chart-of-accounts");
      const accountsData = Array.isArray(accRes)
        ? accRes
        : accRes?.accounts || accRes?.data || [];

      return accountsData.map((a: any) => ({
        id: a.id,
        referenceNumber: a.referenceNumber,
        accountName: a.accountName,
      })) as ChartOfAccountOption[];
    },
    staleTime: 1000 * 60 * 10, // Cache COA selama 10 menit
  });
}

// 2. Auto-generate Nomor Transaksi Berikutnya (Mode Create)
export function useNextTransactionNumber(
  journalType: string,
  entryDate: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["next-tx-number", journalType, entryDate],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/api/v1/journal-entry/next-transaction-number",
        { params: { journalType, entryDate } },
      );
      return (data?.transactionNumber || "") as string;
    },
    enabled: enabled && !!journalType && !!entryDate,
  });
}

// 3. Fetch Detail Entri Jurnal (Mode Edit)
export function useJournalEntryDetail(entryId: string | null) {
  return useQuery({
    queryKey: ["journal-entry-detail", entryId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/journal-entry/${entryId}`);
      return data;
    },
    enabled: !!entryId,
  });
}

// 4. Mutasi Save / Update Journal Entry
export function useSaveJournalEntry(entryId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JournalEntryPayload) => {
      if (entryId) {
        const { data } = await apiClient.put(
          `/api/v1/journal-entry/edit/${entryId}`,
          payload,
        );
        return data;
      } else {
        const { data } = await apiClient.post(
          `/api/v1/journal-entry/create`,
          payload,
        );
        return data;
      }
    },
    onSuccess: () => {
      // Invalidate cache jurnal & laporan keuangan terkait
      queryClient.invalidateQueries({ queryKey: ["next-tx-number"] });
      queryClient.invalidateQueries({ queryKey: ["general-journal"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
