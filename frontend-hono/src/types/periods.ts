// src/types/periods.ts

export interface PeriodItem {
    id: number;
    periodName: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
    status: "Open" | "Closed" | string;
    isSelected: boolean;
}

export interface PeriodsOpenInfo {
    hasExistingPermanentAccounts: boolean;
    availableCashAndBankAccounts?: Array<{
        id: number;
        name: string;
        code: string;
    }>;
    availableRetainedEarningsAccounts?: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

export interface CreatePeriodRequest {
    month: number;
    year: number;
    setupMode: "LoadExisting" | "CreateNew";
    cashAccountId?: number | null;
    bankAccountId?: number | null;
    retainedEarningsAccountId?: number | null;
    cashAccountCode?: string;
    cashAccountName?: string;
    cashBalance?: number;
    bankAccountCode?: string;
    bankAccountName?: string;
    bankBalance?: number;
    retainedEarningsAccountCode?: string;
    retainedEarningsAccountName?: string;
}

export type CreatePeriodArg = {
    createPeriodRequest: CreatePeriodRequest;
};