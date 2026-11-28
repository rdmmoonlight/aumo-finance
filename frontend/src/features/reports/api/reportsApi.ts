import { baseApi } from "@/lib/apiClient";

export const addTagTypes = [
  "Summary",
  "FinancialStatements",
  "GeneralLedgers",
  "Journals",
  "TrialBalances",
  "Worksheet",
] as const;

export const reportsApi = baseApi
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // GET /summary
      getSummary: build.query<GetSummaryApiResponse, GetSummaryApiArg>({
        query: () => "/summary",
        providesTags: ["Summary"],
      }),

      // GET /reports/income-statement
      getIncomeStatement: build.query<
        GetIncomeStatementApiResponse,
        GetIncomeStatementApiArg
      >({
        query: () => "/reports/income-statement",
        providesTags: ["FinancialStatements"],
      }),

      // GET /reports/retained-earnings
      getRetainedEarnings: build.query<
        GetRetainedEarningsApiResponse,
        GetRetainedEarningsApiArg
      >({
        query: () => "/reports/retained-earnings",
        providesTags: ["FinancialStatements"],
      }),

      // GET /reports/statement-of-cash-flow
      getStatementOfCashFlow: build.query<
        GetStatementOfCashFlowApiResponse,
        GetStatementOfCashFlowApiArg
      >({
        query: () => "/reports/statement-of-cash-flow",
        providesTags: ["FinancialStatements"],
      }),

      // GET /reports/statement-of-financial-position
      getStatementOfFinancialPosition: build.query<
        GetStatementOfFinancialPositionApiResponse,
        GetStatementOfFinancialPositionApiArg
      >({
        query: (queryArg) => ({
          url: "/reports/statement-of-financial-position",
          params: {
            isPostClosing: queryArg?.isPostClosing,
          },
        }),
        providesTags: ["FinancialStatements"],
      }),

      // GET /reports/general-ledgers/permanent
      getGeneralLedgerPermanent: build.query<
        GetGeneralLedgerPermanentApiResponse,
        GetGeneralLedgerPermanentApiArg
      >({
        query: () => "/reports/general-ledgers/permanent",
        providesTags: ["GeneralLedgers"],
      }),

      // GET /reports/general-ledgers/temporary
      getGeneralLedgerTemporary: build.query<
        GetGeneralLedgerTemporaryApiResponse,
        GetGeneralLedgerTemporaryApiArg
      >({
        query: () => "/reports/general-ledgers/temporary",
        providesTags: ["GeneralLedgers"],
      }),

      // POST /reports/general-ledgers/refresh
      refreshGeneralLedger: build.mutation<
        RefreshGeneralLedgerApiResponse,
        RefreshGeneralLedgerApiArg
      >({
        query: () => ({
          url: "/reports/general-ledgers/refresh",
          method: "POST",
        }),
        invalidatesTags: ["GeneralLedgers"],
      }),

      // GET /reports/journals/general
      getJournalsGeneral: build.query<
        GetJournalsGeneralApiResponse,
        GetJournalsGeneralApiArg
      >({
        query: () => "/reports/journals/general",
        providesTags: ["Journals"],
      }),

      // DELETE /reports/journals/general/{id}
      deleteJournalsGeneralById: build.mutation<
        DeleteJournalsGeneralByIdApiResponse,
        DeleteJournalsGeneralByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/journals/general/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Journals"],
      }),

      // GET /reports/journals/adjusting
      getJournalsAdjusting: build.query<
        GetJournalsAdjustingApiResponse,
        GetJournalsAdjustingApiArg
      >({
        query: () => "/reports/journals/adjusting",
        providesTags: ["Journals"],
      }),

      // DELETE /reports/journals/adjusting/{id}
      deleteJournalsAdjustingById: build.mutation<
        DeleteJournalsAdjustingByIdApiResponse,
        DeleteJournalsAdjustingByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/journals/adjusting/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Journals"],
      }),

      // GET /reports/journals/closing
      getJournalsClosing: build.query<
        GetJournalsClosingApiResponse,
        GetJournalsClosingApiArg
      >({
        query: () => "/reports/journals/closing",
        providesTags: ["Journals"],
      }),

      // GET /reports/trial-balances?type=unadjusted|adjusted|post-closing
      getTrialBalance: build.query<
        GetTrialBalanceApiResponse,
        GetTrialBalanceApiArg
      >({
        query: (queryArg) => ({
          url: "/reports/trial-balances",
          params: { type: queryArg?.type ?? "unadjusted" },
        }),
        providesTags: ["TrialBalances"],
      }),

      // GET /reports/worksheet
      getWorksheet: build.query<GetWorksheetApiResponse, GetWorksheetApiArg>({
        query: () => "/reports/worksheet",
        providesTags: ["Worksheet"],
      }),
    }),
    overrideExisting: false,
  });

// --- Export Hooks ---
export const {
  useGetSummaryQuery,
  useGetIncomeStatementQuery,
  useGetRetainedEarningsQuery,
  useGetStatementOfCashFlowQuery,
  useGetStatementOfFinancialPositionQuery,
  useGetGeneralLedgerPermanentQuery,
  useGetGeneralLedgerTemporaryQuery,
  useRefreshGeneralLedgerMutation,
  useGetJournalsGeneralQuery,
  useDeleteJournalsGeneralByIdMutation,
  useGetJournalsAdjustingQuery,
  useDeleteJournalsAdjustingByIdMutation,
  useGetJournalsClosingQuery,
  useGetTrialBalanceQuery,
  useGetWorksheetQuery,
} = reportsApi;

// --- Types DTO & Response ---
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

export type DeleteJournalsGeneralByIdApiResponse = any;
export type DeleteJournalsGeneralByIdApiArg = {
  id: number | string;
};

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

export type SummaryResponse = GetSummaryApiResponse;
export type GeneralLedgerTemporaryResponse =
  GetGeneralLedgerTemporaryApiResponse;

export type GetWorksheetApiResponse = any;
export type GetWorksheetApiArg = void;
