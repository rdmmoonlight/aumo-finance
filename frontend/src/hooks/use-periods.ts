import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { usePeriodStore } from "@/lib/periodStore";

export interface PeriodItem {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isSelected?: boolean;
}

export function usePeriods() {
  const queryClient = useQueryClient();
  const { selectedPeriod, setSelectedPeriod, clearSelectedPeriod } =
    usePeriodStore();

  // 1. Fetch Daftar Periode
  const periodsQuery = useQuery({
    queryKey: ["accounting-periods"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/periods");
      // Handle jika format respon backend: data.periods atau data.data
      const periodsList: PeriodItem[] =
        data?.periods || data?.data || data || [];
      const selectedIdFromBackend = data?.selectedPeriodId;

      return {
        periodsList,
        selectedIdFromBackend,
      };
    },
  });

  const periods = periodsQuery.data?.periodsList || [];

  // 2. SINKRONISASI OTOMATIS SAAT RELOAD (Kunci Perbaikan)
  useEffect(() => {
    if (periods.length > 0) {
      // Cari periode yang bernilai isSelected === true atau ID-nya sesuai selectedPeriodId backend
      const activePeriod =
        periods.find((p) => p.isSelected) ||
        periods.find((p) => p.id === periodsQuery.data?.selectedIdFromBackend);

      if (activePeriod) {
        setSelectedPeriod(activePeriod);
      }
    }
  }, [periods, periodsQuery.data?.selectedIdFromBackend, setSelectedPeriod]);

  // 3. Mutation: Pilih Periode Aktif
  const selectPeriodMutation = useMutation({
    mutationFn: async (periodId: number) => {
      const { data } = await apiClient.post(
        `/api/v1/periods/select/${periodId}`,
      );
      return data;
    },
    onSuccess: (_, periodId) => {
      const target = periods.find((p) => p.id === periodId);
      if (target) {
        setSelectedPeriod({ ...target, isSelected: true });
      }
      queryClient.invalidateQueries({ queryKey: ["accounting-periods"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  // 4. Mutation: Hentikan Mode View Periode
  const clearSelectionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/api/v1/periods/clear-selection");
      return data;
    },
    onSuccess: () => {
      clearSelectedPeriod();
      queryClient.invalidateQueries({ queryKey: ["accounting-periods"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  // 5. Mutation: Tutup Periode (Close Period)
  const closePeriodMutation = useMutation({
    mutationFn: async (periodId: number) => {
      const { data } = await apiClient.post(
        `/api/v1/periods/close/${periodId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-periods"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return {
    periods,
    isLoading: periodsQuery.isLoading,
    isError: periodsQuery.isError,
    selectedPeriod,
    selectPeriod: selectPeriodMutation,
    clearSelection: clearSelectionMutation,
    closePeriod: closePeriodMutation,
  };
}
