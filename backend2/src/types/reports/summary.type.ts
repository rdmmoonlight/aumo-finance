import { z } from 'zod';

// 1. Period detail - untuk extra FE selectedPeriod
export const periodDetailSchema = z.object({
    id: z.string(), // Guid dari C#
    periodName: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isClosed: z.boolean(),
});
export type PeriodDetail = z.infer<typeof periodDetailSchema>;

// 2. Summary - canonical (C# + FE extra)
export const summarySchema = z.object({
    selectedPeriodId: z.string().nullable().optional(), // Guid? -> string|null
    totalJournal: z.number().int().default(0),
    activeCoa: z.number().int().default(0),
    activePeriodName: z.string().default(''),
    isPeriodOpen: z.boolean().default(false),
    // Extra FE - nggak ada di C# tapi dipakai di dashboard
    selectedPeriod: periodDetailSchema.nullable().optional(),
});
export type Summary = z.infer<typeof summarySchema>;
export type SummaryDto = Summary; // alias C#

// 3. Generic ApiResponse<T> - dari C# ApiResponse<T>
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
    return z.object({
        success: z.boolean(),
        message: z.string().nullable().optional(),
        data: dataSchema.nullable().optional(),
    });
}
export type ApiResponse<T> = {
    success: boolean;
    message?: string | null;
    data?: T | null;
};

export const summaryResponseSchema = createApiResponseSchema(summarySchema);
type SummaryResponse = ApiResponse<Summary>;