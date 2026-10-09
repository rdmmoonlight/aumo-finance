import { z } from 'zod';

// 1. Constants - dari C# const ModeLoadExisting / ModeCreateNew
export const PERIOD_SETUP_MODE = {
    LoadExisting: 'LoadExisting',
    CreateNew: 'CreateNew',
} as const;
export const setupModeSchema = z.enum([PERIOD_SETUP_MODE.LoadExisting, PERIOD_SETUP_MODE.CreateNew]);
export type SetupMode = z.infer<typeof setupModeSchema>;

// 2. Create Period - gabung 2 mode jadi 1 schema + superRefine
export const createPeriodRequestSchema = z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
    setupMode: setupModeSchema.or(z.string().default('')), // C# string.Empty

    // Mode LoadExisting
    cashAccountId: z.number().int().nullable().optional(),
    bankAccountId: z.number().int().nullable().optional(),
    retainedEarningsAccountId: z.number().int().nullable().optional(),

    // Mode CreateNew
    cashAccountCode: z.string().nullable().optional(),
    cashAccountName: z.string().nullable().optional(),
    cashBalance: z.number().nullable().optional(),

    bankAccountCode: z.string().nullable().optional(),
    bankAccountName: z.string().nullable().optional(),
    bankBalance: z.number().nullable().optional(),

    retainedEarningsAccountCode: z.string().nullable().optional(),
    retainedEarningsAccountName: z.string().nullable().optional(),
});
export type CreatePeriodRequest = z.infer<typeof createPeriodRequestSchema>;

// 3. Period
export const periodDtoSchema = z.object({
    id: z.number().int(),
    periodName: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isClosed: z.boolean(),
    isSelected: z.boolean(),
});
export type PeriodDto = z.infer<typeof periodDtoSchema>;

export const getPeriodsResponseSchema = z.object({
    success: z.boolean(),
    selectedPeriodId: z.number().int().nullable().optional(),
    periods: z.array(periodDtoSchema).default([]),
});
export type GetPeriodsResponse = z.infer<typeof getPeriodsResponseSchema>;

// 4. Account Simple
export const accountSimpleDtoSchema = z.object({
    id: z.number().int(),
    referenceNumber: z.number().int(),
    accountName: z.string(),
    type: z.string(),
    displayLabel: z.string(), // "101 - Cash"
});
export type AccountSimpleDto = z.infer<typeof accountSimpleDtoSchema>;

export const openPeriodInfoResponseSchema = z.object({
    success: z.boolean(),
    hasExistingPermanentAccounts: z.boolean(),
    availableCashAndBankAccounts: z.array(accountSimpleDtoSchema).default([]),
    availableRetainedEarningsAccounts: z.array(accountSimpleDtoSchema).default([]),
    permanentAccounts: z.array(accountSimpleDtoSchema).default([]),
});
export type OpenPeriodInfoResponse = z.infer<typeof openPeriodInfoResponseSchema>;

// 5. Results
export const baseServiceResultSchema = z.object({
    success: z.boolean(),
    message: z.string().default(''),
});
export type BaseServiceResult = z.infer<typeof baseServiceResultSchema>;

export const createPeriodResultSchema = baseServiceResultSchema.extend({
    periodId: z.number().int().nullable().optional(),
    isServerError: z.boolean().optional().default(false),
});
export type CreatePeriodResult = z.infer<typeof createPeriodResultSchema>;

export const selectPeriodResultSchema = z.object({
    success: z.boolean(),
    selectedPeriodId: z.number().int(),
    message: z.string().default(''),
});
export type SelectPeriodResult = z.infer<typeof selectPeriodResultSchema>;
import { z } from 'zod';
export const createPeriodSchema = z.object({});
