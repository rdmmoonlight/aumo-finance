import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export type GetTrialBalanceApiResponse = any;
export type GetTrialBalanceApiArg = {
    type?: "unadjusted" | "adjusted" | "post-closing";
};

export const trialBalancesKeys = {
    all: ["TrialBalances"] as const,
    list: (arg?: GetTrialBalanceApiArg) =>
        [...trialBalancesKeys.all, "list", arg ?? { type: "unadjusted" }] as const,
};

// GET /reports/trial-balances?type=unadjusted|adjusted|post-closing
export function useGetTrialBalance(arg?: GetTrialBalanceApiArg) {
    return useQuery({
        queryKey: trialBalancesKeys.list(arg),
        queryFn: async (): Promise<GetTrialBalanceApiResponse> => {
            const res = await apiClient.get("/reports/trial-balances", {
                params: { type: arg?.type ?? "unadjusted" },
            });
            return res.data;
        },
    });
}
