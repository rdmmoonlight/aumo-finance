import { z } from 'zod';

export interface MarketIndicator {
    symbol: string;
    name: string;
    price: number;
    change: number; // percent change
    previousClose?: number;
    source?: string;
}

export const marketIndicatorSchema = z.object({
    symbol: z.string(),
    name: z.string(),
    price: z.number(),
    change: z.number()
});

export type MarketIndicatorDto = MarketIndicator;

// Untuk ApiIndonesia response (di MarketDataService C# kedua)
export interface ApiIndonesiaKursResponse {
    data?: {
        rate: number;
        change: number;
        base: string;
        target: string;
    };
}
