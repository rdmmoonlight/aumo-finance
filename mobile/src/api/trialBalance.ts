import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { TrialBalanceType } from "./types";

export const trialBalanceService = {
  getTrialBalance: async (type: TrialBalanceType, periodId?: string) => {
    const response = await apiClient.get("/api/reports/trial-balance", {
      params: { type, periodId },
    });
    return response.data;
  },
};

export const useTrialBalance = (type: TrialBalanceType, periodId?: string) => {
  return useQuery({
    queryKey: ["trial-balance", type, periodId],
    queryFn: () => trialBalanceService.getTrialBalance(type, periodId),
    enabled: !!type,
  });
};
