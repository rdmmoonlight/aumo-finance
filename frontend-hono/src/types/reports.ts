// src/types/reports.ts

export type GetSummaryApiResponse = any;
export type GetSummaryApiArg = void;

export type GetIncomeStatementApiResponse = any;
export type GetIncomeStatementApiArg = void;

export type GetRetainedEarningsApiResponse = any;
export type GetRetainedEarningsApiArg = void;

export type GetStatementOfCashFlowApiResponse = any;
export type GetStatementOfCashFlowApiArg = void;

export type GetStatementOfFinancialPositionApiResponse = any;
export type GetStatementOfFinancialPositionApiArg = {
    isPostClosing?: boolean;
};

export type GetGeneralLedgerPermanentApiResponse = {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    message?: string;
    accounts?: Array<any>;
};
export type GetGeneralLedgerPermanentApiArg = void;

export type GetGeneralLedgerTemporaryApiResponse = {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    netIncomeBeforeClosing?: number;
    message?: string;
    accounts?: Array<any>;
};
export type GetGeneralLedgerTemporaryApiArg = void;

export type RefreshGeneralLedgerApiResponse = {
    success: boolean;
    message?: string;
    [key: string]: any;
};
export type RefreshGeneralLedgerApiArg = void;

export type GetJournalsGeneralApiResponse = any;
export type GetJournalsGeneralApiArg = void;

export type GetJournalsAdjustingApiResponse = any;
export type GetJournalsAdjustingApiArg = void;

export type DeleteJournalsAdjustingByIdApiResponse = any;
export type DeleteJournalsAdjustingByIdApiArg = {
    id: number | string;
};

export type GetJournalsClosingApiResponse = any;
export type GetJournalsClosingApiArg = void;

export type GetTrialBalanceApiResponse = any;
export type GetTrialBalanceApiArg = {
    type?: "unadjusted" | "adjusted" | "post-closing";
} | void;

export type GetWorksheetApiResponse = any;
export type GetWorksheetApiArg = void;

// Alias nama lama
export type SummaryResponse = GetSummaryApiResponse;
export type GeneralLedgerTemporaryResponse = GetGeneralLedgerTemporaryApiResponse;