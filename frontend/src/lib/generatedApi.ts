import { baseApi as api } from "./apiClient";
export const addTagTypes = [
  "AumoBackend",
  "Auth",
  "ChartOfAccounts",
  "Dashboard",
  "Guardian",
  "Health",
  "JournalEntry",
  "Periods",
  "Tools",
  "TestEmail",
  "GeneralLedger",
  "IncomeStatement",
  "Journal",
  "RetainedEarnings",
  "StatementOfCashFlow",
  "StatementOfFinancialPosition",
  "TrialBalance",
  "Worksheet",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      $get: build.query<$getApiResponse, $getApiArg>({
        query: () => ({ url: `/` }),
        providesTags: ["AumoBackend"],
      }),
      head: build.mutation<HeadApiResponse, HeadApiArg>({
        query: () => ({ url: `/`, method: "HEAD" }),
        invalidatesTags: ["AumoBackend"],
      }),
      postAuthLogout: build.mutation<
        PostAuthLogoutApiResponse,
        PostAuthLogoutApiArg
      >({
        query: () => ({ url: `/auth/logout`, method: "POST" }),
        invalidatesTags: ["AumoBackend"],
      }),
      postApiV1AuthLogin: build.mutation<
        PostApiV1AuthLoginApiResponse,
        PostApiV1AuthLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      postApiV1AuthGoogleLogin: build.mutation<
        PostApiV1AuthGoogleLoginApiResponse,
        PostApiV1AuthGoogleLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/google-login`,
          method: "POST",
          body: queryArg.googleLoginRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      getApiV1AuthMe: build.query<
        GetApiV1AuthMeApiResponse,
        GetApiV1AuthMeApiArg
      >({
        query: () => ({ url: `/api/v1/auth/me` }),
        providesTags: ["Auth"],
      }),
      postApiV1AuthLogout: build.mutation<
        PostApiV1AuthLogoutApiResponse,
        PostApiV1AuthLogoutApiArg
      >({
        query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
        invalidatesTags: ["Auth"],
      }),
      getApiV1ChartOfAccounts: build.query<
        GetApiV1ChartOfAccountsApiResponse,
        GetApiV1ChartOfAccountsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/chart-of-accounts`,
          params: {
            search: queryArg.search,
            category: queryArg.category,
          },
        }),
        providesTags: ["ChartOfAccounts"],
      }),
      postApiV1ChartOfAccounts: build.mutation<
        PostApiV1ChartOfAccountsApiResponse,
        PostApiV1ChartOfAccountsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/chart-of-accounts`,
          method: "POST",
          body: queryArg.createAccountRequest,
        }),
        invalidatesTags: ["ChartOfAccounts"],
      }),
      putApiV1ChartOfAccountsById: build.mutation<
        PutApiV1ChartOfAccountsByIdApiResponse,
        PutApiV1ChartOfAccountsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/chart-of-accounts/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateAccountRequest,
        }),
        invalidatesTags: ["ChartOfAccounts"],
      }),
      deleteApiV1ChartOfAccountsById: build.mutation<
        DeleteApiV1ChartOfAccountsByIdApiResponse,
        DeleteApiV1ChartOfAccountsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/chart-of-accounts/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ChartOfAccounts"],
      }),
      getApiV1Dashboard: build.query<
        GetApiV1DashboardApiResponse,
        GetApiV1DashboardApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dashboard`,
          params: {
            period: queryArg.period,
          },
        }),
        providesTags: ["Dashboard"],
      }),
      getApiV1GuardianDashboard: build.query<
        GetApiV1GuardianDashboardApiResponse,
        GetApiV1GuardianDashboardApiArg
      >({
        query: () => ({ url: `/api/v1/guardian/dashboard` }),
        providesTags: ["Guardian"],
      }),
      postApiV1GuardianRevokeSessionBySessionId: build.mutation<
        PostApiV1GuardianRevokeSessionBySessionIdApiResponse,
        PostApiV1GuardianRevokeSessionBySessionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/guardian/revoke-session/${queryArg.sessionId}`,
          method: "POST",
        }),
        invalidatesTags: ["Guardian"],
      }),
      postApiV1GuardianRevokeAllSessions: build.mutation<
        PostApiV1GuardianRevokeAllSessionsApiResponse,
        PostApiV1GuardianRevokeAllSessionsApiArg
      >({
        query: () => ({
          url: `/api/v1/guardian/revoke-all-sessions`,
          method: "POST",
        }),
        invalidatesTags: ["Guardian"],
      }),
      getApiV1Health: build.query<
        GetApiV1HealthApiResponse,
        GetApiV1HealthApiArg
      >({
        query: () => ({ url: `/api/v1/health` }),
        providesTags: ["Health"],
      }),
      getApiV1JournalEntryById: build.query<
        GetApiV1JournalEntryByIdApiResponse,
        GetApiV1JournalEntryByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/journal-entry/${queryArg.id}` }),
        providesTags: ["JournalEntry"],
      }),
      postApiV1JournalEntryCreate: build.mutation<
        PostApiV1JournalEntryCreateApiResponse,
        PostApiV1JournalEntryCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/journal-entry/create`,
          method: "POST",
          body: queryArg.createJournalEntryRequest,
        }),
        invalidatesTags: ["JournalEntry"],
      }),
      putApiV1JournalEntryEditById: build.mutation<
        PutApiV1JournalEntryEditByIdApiResponse,
        PutApiV1JournalEntryEditByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/journal-entry/edit/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateJournalEntryRequest,
        }),
        invalidatesTags: ["JournalEntry"],
      }),
      deleteApiV1JournalEntryDeleteById: build.mutation<
        DeleteApiV1JournalEntryDeleteByIdApiResponse,
        DeleteApiV1JournalEntryDeleteByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/journal-entry/delete/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["JournalEntry"],
      }),
      getApiV1JournalEntrySearchDescriptions: build.query<
        GetApiV1JournalEntrySearchDescriptionsApiResponse,
        GetApiV1JournalEntrySearchDescriptionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/journal-entry/search-descriptions`,
          params: {
            q: queryArg.q,
          },
        }),
        providesTags: ["JournalEntry"],
      }),
      getApiV1JournalEntryNextTransactionNumber: build.query<
        GetApiV1JournalEntryNextTransactionNumberApiResponse,
        GetApiV1JournalEntryNextTransactionNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/journal-entry/next-transaction-number`,
          params: {
            journalType: queryArg.journalType,
            entryDate: queryArg.entryDate,
          },
        }),
        providesTags: ["JournalEntry"],
      }),
      getApiV1Periods: build.query<
        GetApiV1PeriodsApiResponse,
        GetApiV1PeriodsApiArg
      >({
        query: () => ({ url: `/api/v1/periods` }),
        providesTags: ["Periods"],
      }),
      postApiV1Periods: build.mutation<
        PostApiV1PeriodsApiResponse,
        PostApiV1PeriodsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/periods`,
          method: "POST",
          body: queryArg.createPeriodRequest,
        }),
        invalidatesTags: ["Periods"],
      }),
      getApiV1PeriodsOpenInfo: build.query<
        GetApiV1PeriodsOpenInfoApiResponse,
        GetApiV1PeriodsOpenInfoApiArg
      >({
        query: () => ({ url: `/api/v1/periods/open-info` }),
        providesTags: ["Periods"],
      }),
      postApiV1PeriodsSelectById: build.mutation<
        PostApiV1PeriodsSelectByIdApiResponse,
        PostApiV1PeriodsSelectByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/periods/select/${queryArg.id}`,
          method: "POST",
        }),
        invalidatesTags: ["Periods"],
      }),
      postApiV1PeriodsClearSelection: build.mutation<
        PostApiV1PeriodsClearSelectionApiResponse,
        PostApiV1PeriodsClearSelectionApiArg
      >({
        query: () => ({
          url: `/api/v1/periods/clear-selection`,
          method: "POST",
        }),
        invalidatesTags: ["Periods"],
      }),
      postApiV1PeriodsCloseById: build.mutation<
        PostApiV1PeriodsCloseByIdApiResponse,
        PostApiV1PeriodsCloseByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/periods/close/${queryArg.id}`,
          method: "POST",
        }),
        invalidatesTags: ["Periods"],
      }),
      getApiV1ToolsDownloadJournalTemplate: build.query<
        GetApiV1ToolsDownloadJournalTemplateApiResponse,
        GetApiV1ToolsDownloadJournalTemplateApiArg
      >({
        query: () => ({ url: `/api/v1/tools/download-journal-template` }),
        providesTags: ["Tools"],
      }),
      postApiV1ToolsPreviewJournalImport: build.mutation<
        PostApiV1ToolsPreviewJournalImportApiResponse,
        PostApiV1ToolsPreviewJournalImportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/tools/preview-journal-import`,
          method: "POST",
          body: queryArg.journalImportRequestDto,
        }),
        invalidatesTags: ["Tools"],
      }),
      postApiV1ToolsImportJournalEntries: build.mutation<
        PostApiV1ToolsImportJournalEntriesApiResponse,
        PostApiV1ToolsImportJournalEntriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/tools/import-journal-entries`,
          method: "POST",
          body: queryArg.journalImportRequestDto,
        }),
        invalidatesTags: ["Tools"],
      }),
      postApiV1TestEmailResendVerification: build.mutation<
        PostApiV1TestEmailResendVerificationApiResponse,
        PostApiV1TestEmailResendVerificationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/test-email/resend-verification`,
          method: "POST",
          body: queryArg.resendRequest,
        }),
        invalidatesTags: ["TestEmail"],
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
      getApiV1ReportsIncomeStatement: build.query<
        GetApiV1ReportsIncomeStatementApiResponse,
        GetApiV1ReportsIncomeStatementApiArg
      >({
        query: () => ({ url: `/api/v1/reports/income-statement` }),
        providesTags: ["IncomeStatement"],
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
      getApiV1ReportsRetainedEarnings: build.query<
        GetApiV1ReportsRetainedEarningsApiResponse,
        GetApiV1ReportsRetainedEarningsApiArg
      >({
        query: () => ({ url: `/api/v1/reports/retained-earnings` }),
        providesTags: ["RetainedEarnings"],
      }),
      getApiV1ReportsStatementOfCashFlow: build.query<
        GetApiV1ReportsStatementOfCashFlowApiResponse,
        GetApiV1ReportsStatementOfCashFlowApiArg
      >({
        query: () => ({ url: `/api/v1/reports/statement-of-cash-flow` }),
        providesTags: ["StatementOfCashFlow"],
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
        providesTags: ["StatementOfFinancialPosition"],
      }),
      getApiV1ReportsTrialBalance: build.query<
        GetApiV1ReportsTrialBalanceApiResponse,
        GetApiV1ReportsTrialBalanceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/trial-balance`,
          params: {
            type: queryArg["type"],
          },
        }),
        providesTags: ["TrialBalance"],
      }),
      getApiV1ReportsTrialBalanceUnadjusted: build.query<
        GetApiV1ReportsTrialBalanceUnadjustedApiResponse,
        GetApiV1ReportsTrialBalanceUnadjustedApiArg
      >({
        query: () => ({ url: `/api/v1/reports/trial-balance/unadjusted` }),
        providesTags: ["TrialBalance"],
      }),
      getApiV1ReportsTrialBalanceAdjusted: build.query<
        GetApiV1ReportsTrialBalanceAdjustedApiResponse,
        GetApiV1ReportsTrialBalanceAdjustedApiArg
      >({
        query: () => ({ url: `/api/v1/reports/trial-balance/adjusted` }),
        providesTags: ["TrialBalance"],
      }),
      getApiV1ReportsTrialBalancePostClosing: build.query<
        GetApiV1ReportsTrialBalancePostClosingApiResponse,
        GetApiV1ReportsTrialBalancePostClosingApiArg
      >({
        query: () => ({ url: `/api/v1/reports/trial-balance/post-closing` }),
        providesTags: ["TrialBalance"],
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
export { injectedRtkApi as generatedApi };
export type $getApiResponse = unknown;
export type $getApiArg = void;
export type HeadApiResponse = unknown;
export type HeadApiArg = void;
export type PostAuthLogoutApiResponse = unknown;
export type PostAuthLogoutApiArg = void;
export type PostApiV1AuthLoginApiResponse = unknown;
export type PostApiV1AuthLoginApiArg = {
  loginRequest: LoginRequest;
};
export type PostApiV1AuthGoogleLoginApiResponse = unknown;
export type PostApiV1AuthGoogleLoginApiArg = {
  googleLoginRequest: GoogleLoginRequest;
};
export type GetApiV1AuthMeApiResponse = unknown;
export type GetApiV1AuthMeApiArg = void;
export type PostApiV1AuthLogoutApiResponse = unknown;
export type PostApiV1AuthLogoutApiArg = void;
export type GetApiV1ChartOfAccountsApiResponse = unknown;
export type GetApiV1ChartOfAccountsApiArg = {
  search?: string;
  category?: string;
};
export type PostApiV1ChartOfAccountsApiResponse = unknown;
export type PostApiV1ChartOfAccountsApiArg = {
  createAccountRequest: CreateAccountRequest;
};
export type PutApiV1ChartOfAccountsByIdApiResponse = unknown;
export type PutApiV1ChartOfAccountsByIdApiArg = {
  id: number;
  updateAccountRequest: UpdateAccountRequest;
};
export type DeleteApiV1ChartOfAccountsByIdApiResponse = unknown;
export type DeleteApiV1ChartOfAccountsByIdApiArg = {
  id: number;
};
export type GetApiV1DashboardApiResponse = unknown;
export type GetApiV1DashboardApiArg = {
  period?: string;
};
export type GetApiV1GuardianDashboardApiResponse = unknown;
export type GetApiV1GuardianDashboardApiArg = void;
export type PostApiV1GuardianRevokeSessionBySessionIdApiResponse = unknown;
export type PostApiV1GuardianRevokeSessionBySessionIdApiArg = {
  sessionId: string;
};
export type PostApiV1GuardianRevokeAllSessionsApiResponse = unknown;
export type PostApiV1GuardianRevokeAllSessionsApiArg = void;
export type GetApiV1HealthApiResponse = unknown;
export type GetApiV1HealthApiArg = void;
export type GetApiV1JournalEntryByIdApiResponse = unknown;
export type GetApiV1JournalEntryByIdApiArg = {
  id: number;
};
export type PostApiV1JournalEntryCreateApiResponse = unknown;
export type PostApiV1JournalEntryCreateApiArg = {
  createJournalEntryRequest: CreateJournalEntryRequest;
};
export type PutApiV1JournalEntryEditByIdApiResponse = unknown;
export type PutApiV1JournalEntryEditByIdApiArg = {
  id: number;
  updateJournalEntryRequest: UpdateJournalEntryRequest;
};
export type DeleteApiV1JournalEntryDeleteByIdApiResponse = unknown;
export type DeleteApiV1JournalEntryDeleteByIdApiArg = {
  id: number;
};
export type GetApiV1JournalEntrySearchDescriptionsApiResponse = unknown;
export type GetApiV1JournalEntrySearchDescriptionsApiArg = {
  q?: string;
};
export type GetApiV1JournalEntryNextTransactionNumberApiResponse = unknown;
export type GetApiV1JournalEntryNextTransactionNumberApiArg = {
  journalType?: string;
  entryDate?: string;
};
export type GetApiV1PeriodsApiResponse = unknown;
export type GetApiV1PeriodsApiArg = void;
export type PostApiV1PeriodsApiResponse = unknown;
export type PostApiV1PeriodsApiArg = {
  createPeriodRequest: CreatePeriodRequest;
};
export type GetApiV1PeriodsOpenInfoApiResponse = unknown;
export type GetApiV1PeriodsOpenInfoApiArg = void;
export type PostApiV1PeriodsSelectByIdApiResponse = unknown;
export type PostApiV1PeriodsSelectByIdApiArg = {
  id: number;
};
export type PostApiV1PeriodsClearSelectionApiResponse = unknown;
export type PostApiV1PeriodsClearSelectionApiArg = void;
export type PostApiV1PeriodsCloseByIdApiResponse = unknown;
export type PostApiV1PeriodsCloseByIdApiArg = {
  id: number;
};
export type GetApiV1ToolsDownloadJournalTemplateApiResponse = unknown;
export type GetApiV1ToolsDownloadJournalTemplateApiArg = void;
export type PostApiV1ToolsPreviewJournalImportApiResponse = unknown;
export type PostApiV1ToolsPreviewJournalImportApiArg = {
  journalImportRequestDto: JournalImportRequestDto;
};
export type PostApiV1ToolsImportJournalEntriesApiResponse = unknown;
export type PostApiV1ToolsImportJournalEntriesApiArg = {
  journalImportRequestDto: JournalImportRequestDto;
};
export type PostApiV1TestEmailResendVerificationApiResponse = unknown;
export type PostApiV1TestEmailResendVerificationApiArg = {
  resendRequest: ResendRequest;
};
export type GetApiV1ReportsGeneralLedgerPermanentApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgerPermanentApiArg = void;
export type GetApiV1ReportsGeneralLedgerTemporaryApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgerTemporaryApiArg = void;
export type GetApiV1ReportsIncomeStatementApiResponse = unknown;
export type GetApiV1ReportsIncomeStatementApiArg = void;
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
export type GetApiV1ReportsRetainedEarningsApiResponse = unknown;
export type GetApiV1ReportsRetainedEarningsApiArg = void;
export type GetApiV1ReportsStatementOfCashFlowApiResponse = unknown;
export type GetApiV1ReportsStatementOfCashFlowApiArg = void;
export type GetApiV1ReportsStatementOfFinancialPositionApiResponse = unknown;
export type GetApiV1ReportsStatementOfFinancialPositionApiArg = {
  isPostClosing?: boolean;
};
export type GetApiV1ReportsTrialBalanceApiResponse = unknown;
export type GetApiV1ReportsTrialBalanceApiArg = {
  type?: string;
};
export type GetApiV1ReportsTrialBalanceUnadjustedApiResponse = unknown;
export type GetApiV1ReportsTrialBalanceUnadjustedApiArg = void;
export type GetApiV1ReportsTrialBalanceAdjustedApiResponse = unknown;
export type GetApiV1ReportsTrialBalanceAdjustedApiArg = void;
export type GetApiV1ReportsTrialBalancePostClosingApiResponse = unknown;
export type GetApiV1ReportsTrialBalancePostClosingApiArg = void;
export type GetApiV1ReportsWorksheetApiResponse = unknown;
export type GetApiV1ReportsWorksheetApiArg = void;
export type LoginRequest = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
  isMobileClient?: boolean;
  userAgent?: null | string;
  operatingSystem?: null | string;
};
export type GoogleLoginRequest = {
  idToken?: string;
  isMobileClient?: boolean;
};
export type CreateAccountRequest = {
  referenceNumber?: number | string;
  accountName?: string;
  type?: string;
  role?: string;
};
export type UpdateAccountRequest = {
  referenceNumber?: number | string;
  accountName?: string;
  type?: string;
  role?: string;
  isActive?: boolean;
};
export type CreateJournalEntryLineRequest = {
  accountId?: number | string;
  debit?: number | string;
  credit?: number | string;
  lineDescription?: null | string;
  lineOrder?: number | string;
};
export type CreateJournalEntryRequest = {
  createdAt?: string;
  entryDate?: string;
  journalType?: string;
  mobileNote?: null | string;
  lines?: CreateJournalEntryLineRequest[];
};
export type JournalEntryLineRequest = {
  accountId?: number | string;
  lineDescription?: string;
  debit?: number | string;
  credit?: number | string;
  lineOrder?: number | string;
};
export type UpdateJournalEntryRequest = {
  entryDate?: string;
  transactionNumber?: string;
  journalType?: string;
  updatedAt?: string;
  lines?: JournalEntryLineRequest[];
};
export type CreatePeriodRequest = {
  periodName?: string;
  startDate?: string;
  endDate?: string;
  month?: number | string;
  year?: number | string;
  setupMode?: string;
  cashAccountId?: null | number | string;
  bankAccountId?: null | number | string;
  retainedEarningsAccountId?: null | number | string;
  cashAccountCode?: null | string;
  cashAccountName?: null | string;
  bankAccountCode?: null | string;
  bankAccountName?: null | string;
  retainedEarningsAccountCode?: null | string;
  retainedEarningsAccountName?: null | string;
  cashBalance?: null | number | string;
  bankBalance?: null | number | string;
};
export type AccountMappingDetailDto = {
  id?: number | string;
  referenceNumber?: string;
  accountName?: string;
  excelRef?: number | string;
  excelAccountName?: string;
  mappedRef?: number | string;
  mappedAccountName?: string;
  status?: string;
  reason?: string;
};
export type JournalLineDto = {
  accountReferenceNumber?: number | string;
  refNumber?: number | string;
  accountName?: string;
  lineDescription?: string;
  description?: string;
  debit?: null | number | string;
  credit?: null | number | string;
};
export type JournalTransactionDto = {
  date?: string;
  entryDate?: string;
  transactionNumber?: string;
  journalType?: string;
  lines?: JournalLineDto[];
};
export type JournalImportRequestDto = {
  targetYear?: number | string;
  targetMonth?: number | string;
  customMappings?: AccountMappingDetailDto[];
  transactions?: JournalTransactionDto[];
};
export type ResendRequest = {
  email: string;
};
export const {
  use$getQuery,
  useHeadMutation,
  usePostAuthLogoutMutation,
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
  useGetApiV1ChartOfAccountsQuery,
  usePostApiV1ChartOfAccountsMutation,
  usePutApiV1ChartOfAccountsByIdMutation,
  useDeleteApiV1ChartOfAccountsByIdMutation,
  useGetApiV1DashboardQuery,
  useGetApiV1GuardianDashboardQuery,
  usePostApiV1GuardianRevokeSessionBySessionIdMutation,
  usePostApiV1GuardianRevokeAllSessionsMutation,
  useGetApiV1HealthQuery,
  useGetApiV1JournalEntryByIdQuery,
  usePostApiV1JournalEntryCreateMutation,
  usePutApiV1JournalEntryEditByIdMutation,
  useDeleteApiV1JournalEntryDeleteByIdMutation,
  useGetApiV1JournalEntrySearchDescriptionsQuery,
  useGetApiV1JournalEntryNextTransactionNumberQuery,
  useGetApiV1PeriodsQuery,
  usePostApiV1PeriodsMutation,
  useGetApiV1PeriodsOpenInfoQuery,
  usePostApiV1PeriodsSelectByIdMutation,
  usePostApiV1PeriodsClearSelectionMutation,
  usePostApiV1PeriodsCloseByIdMutation,
  useGetApiV1ToolsDownloadJournalTemplateQuery,
  usePostApiV1ToolsPreviewJournalImportMutation,
  usePostApiV1ToolsImportJournalEntriesMutation,
  usePostApiV1TestEmailResendVerificationMutation,
  useGetApiV1ReportsGeneralLedgerPermanentQuery,
  useGetApiV1ReportsGeneralLedgerTemporaryQuery,
  useGetApiV1ReportsIncomeStatementQuery,
  useGetApiV1ReportsJournalsGeneralQuery,
  useGetApiV1ReportsJournalsAdjustingQuery,
  useDeleteApiV1ReportsJournalsAdjustingByIdMutation,
  useGetApiV1ReportsJournalsClosingQuery,
  useGetApiV1ReportsRetainedEarningsQuery,
  useGetApiV1ReportsStatementOfCashFlowQuery,
  useGetApiV1ReportsStatementOfFinancialPositionQuery,
  useGetApiV1ReportsTrialBalanceQuery,
  useGetApiV1ReportsTrialBalanceUnadjustedQuery,
  useGetApiV1ReportsTrialBalanceAdjustedQuery,
  useGetApiV1ReportsTrialBalancePostClosingQuery,
  useGetApiV1ReportsWorksheetQuery,
} = injectedRtkApi;
