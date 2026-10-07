import { z } from 'zod';

export const createPeriodRequestSchema = z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    setupMode: z.enum(['LoadExisting', 'New']).default('New'),

    // Mode LoadExisting - pakai akun existing
    cashAccountId: z.number().int().optional(),
    bankAccountId: z.number().int().optional(),
    retainedEarningsAccountId: z.number().int().optional(),

    // Mode New - bikin akun baru
    cashAccountCode: z.string().optional(),
    bankAccountCode: z.string().optional(),
    retainedEarningsAccountCode: z.string().optional(),
    cashAccountName: z.string().optional(),
    bankAccountName: z.string().optional(),
    retainedEarningsAccountName: z.string().optional(),
    cashBalance: z.number().optional(),
    bankBalance: z.number().optional(),
});
export type CreatePeriodRequest = z.infer<typeof createPeriodRequestSchema>;

export interface PeriodDto {
    id: number;
    periodName: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
    isSelected: boolean;
}

export interface GetPeriodsResponse {
    success: boolean;
    selectedPeriodId: number | null;
    periods: PeriodDto[];
}

export interface AccountSimpleDto {
    id: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    displayLabel: string; // "101 - Cash"
}

export interface OpenPeriodInfoResponse {
    success: boolean;
    hasExistingPermanentAccounts: boolean;
    availableCashAndBankAccounts: AccountSimpleDto[];
    availableRetainedEarningsAccounts: AccountSimpleDto[];
    permanentAccounts: AccountSimpleDto[];
}

export interface CreatePeriodResult {
    success: boolean;
    message: string;
    periodId?: number;
    isServerError?: boolean;
}

export interface SelectPeriodResult {
    success: boolean;
    selectedPeriodId: number;
    message: string;
}

export interface BaseServiceResult {
    success: boolean;
    message: string;
}
