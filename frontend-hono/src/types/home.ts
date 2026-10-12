// src/types/home.ts

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