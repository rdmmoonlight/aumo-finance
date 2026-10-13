// periods.ts
export type PeriodDto = {
    id: number;
    periodName: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
    isSelected: boolean;
}

export type AccountSimpleDto = {
    id: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    displayLabel: string;
}

export type GetPeriodsResponse = {
    success: boolean;
    selectedPeriodId: number | null;
    periods: PeriodDto[];
}

export type OpenPeriodInfoResponse = {
    success: boolean;
    hasExistingPermanentAccounts: boolean;
    availableCashAndBankAccounts: AccountSimpleDto[];
    availableRetainedEarningsAccounts: AccountSimpleDto[];
    permanentAccounts: AccountSimpleDto[];
}

export type CreatePeriodRequest = {
    year: number;
    month: number;
    setupMode: 'LoadExisting' | 'CreateNew';
    // LoadExisting
    cashAccountId?: number;
    bankAccountId?: number;
    retainedEarningsAccountId?: number;
    // CreateNew
    cashAccountCode?: string;
    bankAccountCode?: string;
    retainedEarningsAccountCode?: string;
    cashAccountName?: string;
    bankAccountName?: string;
    retainedEarningsAccountName?: string;
    cashBalance?: number;
    bankBalance?: number;
}

export type CreatePeriodResult = {
    success: boolean;
    message: string;
    periodId?: number;
    isServerError?: boolean;
}

export type SelectPeriodResult = {
    success: boolean;
    selectedPeriodId: number;
    message: string;
}

export type BaseServiceResult = {
    success: boolean;
    message: string;
}