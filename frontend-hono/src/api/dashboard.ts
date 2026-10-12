// src/api/dashboard.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    GetDashboardApiArg,
    GetDashboardApiResponse
} from "@/types/dashboard";

/**
 * GET /dashboard
 * Mengambil data ringkasan dashboard berdasarkan parameter periode
 */
export function getDashboard(
    arg?: GetDashboardApiArg
): Promise<GetDashboardApiResponse> {
    const query = arg?.period ? `?period=${encodeURIComponent(arg.period)}` : "";
    const cacheKey = `/dashboard${query}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient<GetDashboardApiResponse>(cacheKey),
        { ttl: 60000, tags: ["Dashboard"] }
    );
}