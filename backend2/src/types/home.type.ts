import { z } from 'zod';

// 1. Kurs - canonical
export const kursDataSchema = z.object({
    base: z.string().default(''),
    target: z.string().default(''),
    rate: z.number(),
    change: z.number(),
});
export type KursData = z.infer<typeof kursDataSchema>;
export type KursDataDto = KursData; // alias, di C# duplikat KursData

export const apiIndonesiaKursResponseSchema = z.object({
    success: z.boolean().default(true),
    data: kursDataSchema.nullable().optional(),
});
export type ApiIndonesiaKursResponse = z.infer<typeof apiIndonesiaKursResponseSchema>;

// 2. Market Indicator - handle C# object Price/Change yang bisa string
const flexibleNumber = z.union([z.number(), z.string()]).transform(v => {
    const num = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v;
    return isNaN(num) ? 0 : num;
});

export const marketIndicatorSchema = z.object({
    symbol: z.string(),
    name: z.string(),
    price: flexibleNumber,
    change: flexibleNumber,
    isUp: z.boolean().optional(), // kalau nggak dikirim, kalkulasi dari change >= 0
    previousClose: z.number().optional(),
    source: z.string().optional(),
}).transform(v => ({
    ...v,
    isUp: v.isUp ?? v.change >= 0, // logic sama kayak di C# IsUp
}));

export type MarketIndicator = z.infer<typeof marketIndicatorSchema>;
export type MarketIndicatorDto = MarketIndicator;

// 3. Generic Wrapper - ApiResponseDto<T>
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
    return z.object({
        success: z.boolean(),
        data: dataSchema.nullable().optional(),
        error: z.string().nullable().optional(),
        message: z.string().nullable().optional(),
    });
}
export type ApiResponseDto<T> = {
    success: boolean;
    data?: T | null;
    error?: string | null;
    message?: string | null;
};

export const marketListResponseSchema = createApiResponseSchema(z.array(marketIndicatorSchema));