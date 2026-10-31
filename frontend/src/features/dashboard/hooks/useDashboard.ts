import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

// --- Types ---
export type GetDashboardApiArg = {
    period?: string;
};

export type GetDashboardApiResponse = unknown; // Sesuaikan dengan DTO/Model dari Controller ASP.NET jika ada

const keys = {
    all: ["dashboard"] as const,
    detail: (filters?: GetDashboardApiArg) => [...keys.all, "detail", filters ?? {}] as const,
};

export const dashboardApi = {
    keys,

    // GET /dashboard?period=
    useGetDashboard: (arg?: GetDashboardApiArg) => {
        return useQuery({
            queryKey: keys.detail(arg),
            queryFn: async (): Promise<GetDashboardApiResponse> => {
                const res = await apiClient.get("/dashboard", {
                    params: {
                        period: arg?.period || undefined,
                    },
                });
                return res.data;
            },
        });
    },
};
