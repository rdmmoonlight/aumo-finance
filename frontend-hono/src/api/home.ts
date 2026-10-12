// src/api/home.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    KursParams,
    KursResponse,
    MarketIndicatorsResponse
} from "@/types/home";

/**
 * GET /kurs
 */
export function getKurs(params?: KursParams): Promise<KursResponse> {
    const queryParams = new URLSearchParams();

    if (params?.baseCurrency) {
        queryParams.append("baseCurrency", params.baseCurrency);
    }
    if (params?.targetCurrency) {
        queryParams.append("targetCurrency", params.targetCurrency);
    }

    const queryString = queryParams.toString();
    const endpoint = `/kurs${queryString ? `?${queryString}` : ""}`;

    return coreStore.fetchWithCache(
        endpoint,
        () => apiClient<KursResponse>(endpoint),
        { ttl: 60000, tags: ["MarketData"] }
    );
}

/**
 * GET /home/market-indicators
 */
export function getMarketIndicators(): Promise<MarketIndicatorsResponse> {
    const endpoint = "/home/market-indicators";

    return coreStore.fetchWithCache(
        endpoint,
        () => apiClient<MarketIndicatorsResponse>(endpoint),
        { ttl: 60000, tags: ["MarketData"] }
    );
}