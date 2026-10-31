import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export type HealthCheckResponse = {
    status?: string;
    timestamp?: string;
    [key: string]: unknown;
};

export const healthKeys = {
    all: ["health"] as const,
    check: () => [...healthKeys.all, "check"] as const,
};

// GET /health
export function useGetHealth() {
    return useQuery({
        queryKey: healthKeys.check(),
        queryFn: async (): Promise<HealthCheckResponse> => {
            const res = await apiClient.get("/health");
            return res.data;
        },
    });
}
