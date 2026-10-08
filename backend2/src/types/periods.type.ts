import { createPeriodRequestSchema } from 'src/db/accounting.schema.ts';
import { z } from 'zod';

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
