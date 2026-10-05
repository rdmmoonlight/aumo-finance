import { baseApi } from "@/lib/apiClient";

export const addTagTypes = [
  "Summary",
  "FinancialStatements",
  "GeneralLedgers",
  "Journal",
  "Worksheet",
] as const;

export const reportsApi = baseApi
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // GET /api/v1/Summary
      getSummary: build.query<GetSummaryApiResponse, GetSummaryApiArg>({
        query: () => "/api/v1/Summary",
        providesTags: ["Summary"],
      }),

      // GET /api/v1/reports/income-statement
      getIncomeStatement: build.query<
        GetIncomeStatementApiResponse,
        GetIncomeStatementApiArg
      >({
        query: () => "/api/v1/reports/income-statement",
        providesTags: ["FinancialStatements"],
      }),

      // GET /api/v1/reports/retained-earnings
      getRetainedEarnings: build.query<
        GetRetainedEarningsApiResponse,
        GetRetainedEarningsApiArg
      >({
        query: () => "/api/v1/reports/retained-earnings",
        providesTags: ["FinancialStatements"],
      }),

      // GET /api/v1/reports/statement-of-cash-flow
      getStatementOfCashFlow: build.query<
        GetStatementOfCashFlowApiResponse,
        GetStatementOfCashFlowApiArg
      >({
        query: () => "/api/v1/reports/statement-of-cash-flow",
        providesTags: ["FinancialStatements"],
      }),

      // GET /api/v1/reports/statement-of-financial-position
      getStatementOfFinancialPosition: build.query<
        GetStatementOfFinancialPositionApiResponse,
        GetStatementOfFinancialPositionApiArg
      >({
        query: (queryArg) => ({
          url: "/api/v1/reports/statement-of-financial-position",
          params: {
            isPostClosing: queryArg?.isPostClosing,
          },
        }),
        providesTags: ["FinancialStatements"],
      }),

      // GET /api/v1/reports/general-ledger/permanent
      getGeneralLedgerPermanent: build.query<
        GetGeneralLedgerPermanentApiResponse,
        GetGeneralLedgerPermanentApiArg
      >({
        query: () => "/api/v1/reports/general-ledger/permanent",
        providesTags: ["GeneralLedgers"],
      }),

      // GET /api/v1/reports/general-ledger/temporary
      getGeneralLedgerTemporary: build.query<
        GetGeneralLedgerTemporaryApiResponse,
        GetGeneralLedgerTemporaryApiArg
      >({
        query: () => "/api/v1/reports/general-ledger/temporary",
        providesTags: ["GeneralLedgers"],
      }),

      // GET /api/v1/reports/journals/general
      getJournalsGeneral: build.query<
        GetJournalsGeneralApiResponse,
        GetJournalsGeneralApiArg
      >({
        query: () => "/api/v1/reports/journals/general",
        providesTags: ["Journal"],
      }),

      // GET /api/v1/reports/journals/adjusting
      getJournalsAdjusting: build.query<
        GetJournalsAdjustingApiResponse,
        GetJournalsAdjustingApiArg
      >({
        query: () => "/api/v1/reports/journals/adjusting",
        providesTags: ["Journal"],
      }),

      // DELETE /api/v1/reports/journals/adjusting/{id}
      deleteJournalsAdjustingById: build.mutation<
        DeleteJournalsAdjustingByIdApiResponse,
        DeleteJournalsAdjustingByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/journals/adjusting/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Journal"],
      }),

      // GET /api/v1/reports/journals/closing
      getJournalsClosing: build.query<
        GetJournalsClosingApiResponse,
        GetJournalsClosingApiArg
      >({
        query: () => "/api/v1/reports/journals/closing",
        providesTags: ["Journal"],
      }),

      // GET /api/v1/reports/trial-balance?type=unadjusted|adjusted|post-closing
      getTrialBalance: build.query<
        GetTrialBalanceApiResponse,
        GetTrialBalanceApiArg
      >({
        query: (queryArg) => ({
          url: "/api/v1/reports/trial-balance",
          params: { type: queryArg?.type ?? "unadjusted" },
        }),
        providesTags: ["FinancialStatements"],
      }),

      // GET /api/v1/reports/worksheet
      getWorksheet: build.query<
        GetWorksheetApiResponse,
        GetWorksheetApiArg
      >({
        query: () => "/api/v1/reports/worksheet",
        providesTags: ["Worksheet"],
      }),
    }),
    overrideExisting: false,
  });

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

export type GetGeneralLedgerPermanentApiResponse = any;
export type GetGeneralLedgerPermanentApiArg = void;

export type GetGeneralLedgerTemporaryApiResponse = any;
export type GetGeneralLedgerTemporaryApiArg = void;

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

// Alias nama lama yang masih diimpor halaman
export type SummaryResponse = GetSummaryApiResponse;
export type GeneralLedgerTemporaryResponse = GetGeneralLedgerTemporaryApiResponse;

export type GetWorksheetApiResponse = any;
export type GetWorksheetApiArg = void;