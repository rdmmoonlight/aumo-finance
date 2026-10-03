import { baseApi as api } from "../../../apiClient";
export const addTagTypes = [
  "Summary",
  "FinancialStatements",
  "GeneralLedger",
  "Journal",
  "Worksheet",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1Summary: build.query<
        GetApiV1SummaryApiResponse,
        GetApiV1SummaryApiArg
      >({
        query: () => ({ url: `/api/v1/Summary` }),
        providesTags: ["Summary"],
      }),
      getApiV1ReportsIncomeStatement: build.query<
        GetApiV1ReportsIncomeStatementApiResponse,
        GetApiV1ReportsIncomeStatementApiArg
      >({
        query: () => ({ url: `/api/v1/reports/income-statement` }),
        providesTags: ["FinancialStatements"],
      }),
      getApiV1ReportsRetainedEarnings: build.query<
        GetApiV1ReportsRetainedEarningsApiResponse,
        GetApiV1ReportsRetainedEarningsApiArg
      >({
        query: () => ({ url: `/api/v1/reports/retained-earnings` }),
        providesTags: ["FinancialStatements"],
      }),
      getApiV1ReportsStatementOfCashFlow: build.query<
        GetApiV1ReportsStatementOfCashFlowApiResponse,
        GetApiV1ReportsStatementOfCashFlowApiArg
      >({
        query: () => ({ url: `/api/v1/reports/statement-of-cash-flow` }),
        providesTags: ["FinancialStatements"],
      }),
      getApiV1ReportsStatementOfFinancialPosition: build.query<
        GetApiV1ReportsStatementOfFinancialPositionApiResponse,
        GetApiV1ReportsStatementOfFinancialPositionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/statement-of-financial-position`,
          params: {
            isPostClosing: queryArg.isPostClosing,
          },
        }),
        providesTags: ["FinancialStatements"],
      }),
      getApiV1ReportsGeneralLedgerPermanent: build.query<
        GetApiV1ReportsGeneralLedgerPermanentApiResponse,
        GetApiV1ReportsGeneralLedgerPermanentApiArg
      >({
        query: () => ({ url: `/api/v1/reports/general-ledger/permanent` }),
        providesTags: ["GeneralLedger"],
      }),
      getApiV1ReportsGeneralLedgerTemporary: build.query<
        GetApiV1ReportsGeneralLedgerTemporaryApiResponse,
        GetApiV1ReportsGeneralLedgerTemporaryApiArg
      >({
        query: () => ({ url: `/api/v1/reports/general-ledger/temporary` }),
        providesTags: ["GeneralLedger"],
      }),
      getApiV1ReportsJournalsGeneral: build.query<
        GetApiV1ReportsJournalsGeneralApiResponse,
        GetApiV1ReportsJournalsGeneralApiArg
      >({
        query: () => ({ url: `/api/v1/reports/journals/general` }),
        providesTags: ["Journal"],
      }),
      getApiV1ReportsJournalsAdjusting: build.query<
        GetApiV1ReportsJournalsAdjustingApiResponse,
        GetApiV1ReportsJournalsAdjustingApiArg
      >({
        query: () => ({ url: `/api/v1/reports/journals/adjusting` }),
        providesTags: ["Journal"],
      }),
      deleteApiV1ReportsJournalsAdjustingById: build.mutation<
        DeleteApiV1ReportsJournalsAdjustingByIdApiResponse,
        DeleteApiV1ReportsJournalsAdjustingByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/journals/adjusting/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Journal"],
      }),
      getApiV1ReportsJournalsClosing: build.query<
        GetApiV1ReportsJournalsClosingApiResponse,
        GetApiV1ReportsJournalsClosingApiArg
      >({
        query: () => ({ url: `/api/v1/reports/journals/closing` }),
        providesTags: ["Journal"],
      }),
      getApiV1ReportsWorksheet: build.query<
        GetApiV1ReportsWorksheetApiResponse,
        GetApiV1ReportsWorksheetApiArg
      >({
        query: () => ({ url: `/api/v1/reports/worksheet` }),
        providesTags: ["Worksheet"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type GetApiV1SummaryApiResponse = unknown;
export type GetApiV1SummaryApiArg = void;
export type GetApiV1ReportsIncomeStatementApiResponse = unknown;
export type GetApiV1ReportsIncomeStatementApiArg = void;
export type GetApiV1ReportsRetainedEarningsApiResponse = unknown;
export type GetApiV1ReportsRetainedEarningsApiArg = void;
export type GetApiV1ReportsStatementOfCashFlowApiResponse = unknown;
export type GetApiV1ReportsStatementOfCashFlowApiArg = void;
export type GetApiV1ReportsStatementOfFinancialPositionApiResponse = unknown;
export type GetApiV1ReportsStatementOfFinancialPositionApiArg = {
  isPostClosing?: boolean;
};
export type GetApiV1ReportsGeneralLedgerPermanentApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgerPermanentApiArg = void;
export type GetApiV1ReportsGeneralLedgerTemporaryApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgerTemporaryApiArg = void;
export type GetApiV1ReportsJournalsGeneralApiResponse = unknown;
export type GetApiV1ReportsJournalsGeneralApiArg = void;
export type GetApiV1ReportsJournalsAdjustingApiResponse = unknown;
export type GetApiV1ReportsJournalsAdjustingApiArg = void;
export type DeleteApiV1ReportsJournalsAdjustingByIdApiResponse = unknown;
export type DeleteApiV1ReportsJournalsAdjustingByIdApiArg = {
  id: number;
};
export type GetApiV1ReportsJournalsClosingApiResponse = unknown;
export type GetApiV1ReportsJournalsClosingApiArg = void;
export type GetApiV1ReportsWorksheetApiResponse = unknown;
export type GetApiV1ReportsWorksheetApiArg = void;
export const {
  useGetApiV1SummaryQuery,
  useGetApiV1ReportsIncomeStatementQuery,
  useGetApiV1ReportsRetainedEarningsQuery,
  useGetApiV1ReportsStatementOfCashFlowQuery,
  useGetApiV1ReportsStatementOfFinancialPositionQuery,
  useGetApiV1ReportsGeneralLedgerPermanentQuery,
  useGetApiV1ReportsGeneralLedgerTemporaryQuery,
  useGetApiV1ReportsJournalsGeneralQuery,
  useGetApiV1ReportsJournalsAdjustingQuery,
  useDeleteApiV1ReportsJournalsAdjustingByIdMutation,
  useGetApiV1ReportsJournalsClosingQuery,
  useGetApiV1ReportsWorksheetQuery,
} = injectedRtkApi;
