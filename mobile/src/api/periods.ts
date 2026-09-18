import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { PeriodConfigPayload } from "./types";

export interface Period {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isSelected: boolean;
}

export interface PeriodsResponse {
  success: boolean;
  selectedPeriodId: number | null;
  periods: Period[];
}

export const periodsService = {
  // GET /api/v1/periods -> daftar periode milik user + periode yang sedang dipilih
  getPeriods: async (): Promise<PeriodsResponse> => {
    const response = await apiClient.get<PeriodsResponse>("/api/v1/periods");
    return response.data;
  },
  // CATATAN: payload di bawah ini (PeriodConfigPayload: name/startDate/endDate/
  // cashAccountId/dst) BELUM cocok dengan kontrak backend saat ini
  // (CreatePeriodRequest butuh month, year, setupMode, dan field berbeda
  // tergantung LoadExisting vs CreateNew). Jangan dipakai sebelum disamakan
  // ulang dengan Controllers/PeriodsController.cs -> CreatePeriodRequest.
  createPeriod: async (payload: PeriodConfigPayload) => {
    const response = await apiClient.post("/api/v1/periods", payload);
    return response.data;
  },
  selectPeriod: async (periodId: number) => {
    const response = await apiClient.post(`/api/v1/periods/select/${periodId}`);
    return response.data;
  },
  closePeriod: async (periodId: number) => {
    const response = await apiClient.post(`/api/v1/periods/close/${periodId}`);
    return response.data;
  },
};

export const usePeriods = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["periods"],
    queryFn: periodsService.getPeriods,
    enabled: options?.enabled ?? true,
  });
};

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PeriodConfigPayload) =>
      periodsService.createPeriod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
  });
};

export const useSelectPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: number) => periodsService.selectPeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
  });
};

export const useClosePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: number) => periodsService.closePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
  });
};
