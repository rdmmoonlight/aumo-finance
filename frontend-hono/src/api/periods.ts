// src/api/periods.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    CreatePeriodArg,
    PeriodItem,
    PeriodsOpenInfo
} from "@/types/periods";

/**
 * GET /periods
 */
export function getPeriods(): Promise<PeriodItem[] | { items: PeriodItem[] }> {
    return coreStore.fetchWithCache(
        "/periods",
        () => apiClient<PeriodItem[] | { items: PeriodItem[] }>("/periods"),
        { ttl: 60000, tags: ["Periods"] }
    );
}

/**
 * GET /periods/open-info
 */
export function getPeriodsOpenInfo(): Promise<PeriodsOpenInfo> {
    return coreStore.fetchWithCache(
        "/periods/open-info",
        () => apiClient<PeriodsOpenInfo>("/periods/open-info"),
        { ttl: 60000, tags: ["Periods"] }
    );
}

/**
 * POST /periods
 */
export async function createPeriod(arg: CreatePeriodArg): Promise<void> {
    const result = await apiClient("/periods", {
        method: "POST",
        body: arg.createPeriodRequest,
    });
    coreStore.invalidate(["Periods"]);
    return result;
}

/**
 * POST /periods/{id}/select
 */
export async function selectPeriod(arg: { id: number }): Promise<void> {
    const result = await apiClient(`/periods/${arg.id}/select`, {
        method: "POST",
    });
    coreStore.invalidate(["Periods"]);
    return result;
}

/**
 * POST /periods/clear-selection
 */
export async function clearSelection(): Promise<void> {
    const result = await apiClient("/periods/clear-selection", {
        method: "POST",
    });
    coreStore.invalidate(["Periods"]);
    return result;
}

/**
 * POST /periods/{id}/close
 */
export async function closePeriod(arg: { id: number }): Promise<void> {
    const result = await apiClient(`/periods/${arg.id}/close`, {
        method: "POST",
    });
    coreStore.invalidate(["Periods"]);
    return result;
}