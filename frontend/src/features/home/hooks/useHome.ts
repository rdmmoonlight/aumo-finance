import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

// --- Types Request & Response ---
export interface KursParams {
    baseCurrency?: string;
    targetCurrency?: string;
}

export interface KursResponse {
    success?: boolean;
    baseCurrency?: string;
    targetCurrency?: string;
    rate?: number;
    lastUpdated?: string;
    [key: string]: unknown;
}

export interface MarketIndicatorItem {
    id?: string;
    name?: string;
    symbol?: string;
    value?: number;
    changePercent?: number;
    [key: string]: unknown;
}

export interface MarketIndicatorsResponse {
    success?: boolean;
    indicators?: MarketIndicatorItem[];
    [key: string]: unknown;
}

const keys = {
    all: ["marketData"] as const,
    kurs: (params?: KursParams) => [...keys.all, "kurs", params ?? {}] as const,
    marketIndicators: () => [...keys.all, "market-indicators"] as const,
};

export const homeApi = {
    keys,

    // 1. GET /kurs?baseCurrency=&targetCurrency=
    useGetKurs: (params?: KursParams) => {
        return useQuery({
            queryKey: keys.kurs(params),
            queryFn: async (): Promise<KursResponse> => {
                const res = await apiClient.get("/kurs", {
                    params: params
                        ? {
                            baseCurrency: params.baseCurrency || undefined,
                            targetCurrency: params.targetCurrency || undefined,
                        }
                        : undefined,
                });
                return res.data as KursResponse;
            },
        });
    },

    // 2. GET /home/market-indicators
    useGetMarketIndicators: () => {
        return useQuery({
            queryKey: keys.marketIndicators(),
            queryFn: async (): Promise<MarketIndicatorsResponse> => {
                const res = await apiClient.get("/home/market-indicators");
                return res.data as MarketIndicatorsResponse;
            },
        });
    },
};
