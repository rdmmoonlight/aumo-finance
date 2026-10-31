import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export type GetSummaryApiResponse = any;

export const summaryKeys = {
    all: ["Summary"] as const,
    detail: () => [...summaryKeys.all, "detail"] as const,
};

// GET /summary
export function useGetSummary() {
    return useQuery({
        queryKey: summaryKeys.detail(),
        queryFn: async (): Promise<GetSummaryApiResponse> => {
            const res = await apiClient.get("/summary");
            return res.data;
        },
    });
}
