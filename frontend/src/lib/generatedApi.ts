import { baseApi as api } from "./apiClient";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    $get: build.query<$getApiResponse, $getApiArg>({
      query: () => ({ url: `/` }),
    }),
    head: build.mutation<HeadApiResponse, HeadApiArg>({
      query: () => ({ url: `/`, method: "HEAD" }),
    }),
    getApiV1HomeMarketIndicators: build.query<
      GetApiV1HomeMarketIndicatorsApiResponse,
      GetApiV1HomeMarketIndicatorsApiArg
    >({
      query: () => ({ url: `/api/v1/home/market-indicators` }),
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
    }),
    getApiV1AuthGoogleLogin: build.query<
      GetApiV1AuthGoogleLoginApiResponse,
      GetApiV1AuthGoogleLoginApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/google-login`,
        params: {
          redirectTo: queryArg.redirectTo,
        },
      }),
    }),
    getApiV1AuthGoogleCallback: build.query<
      GetApiV1AuthGoogleCallbackApiResponse,
      GetApiV1AuthGoogleCallbackApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/google-callback`,
        params: {
          redirectTo: queryArg.redirectTo,
          remoteError: queryArg.remoteError,
        },
      }),
    }),
    getApiV1AuthMe: build.query<
      GetApiV1AuthMeApiResponse,
      GetApiV1AuthMeApiArg
    >({
      query: () => ({ url: `/api/v1/auth/me` }),
    }),
    postApiV1AuthLogout: build.mutation<
      PostApiV1AuthLogoutApiResponse,
      PostApiV1AuthLogoutApiArg
    >({
      query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
    }),
    getApiV1AvatarsByFileName: build.query<
      GetApiV1AvatarsByFileNameApiResponse,
      GetApiV1AvatarsByFileNameApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/avatars/${queryArg.fileName}` }),
    }),
    getApiV1ChartOfAccounts: build.query<
      GetApiV1ChartOfAccountsApiResponse,
      GetApiV1ChartOfAccountsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/chart-of-accounts`,
        params: {
          Search: queryArg.search,
          Category: queryArg.category,
        },
      }),
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
    }),
    deleteApiV1ChartOfAccountsById: build.mutation<
      DeleteApiV1ChartOfAccountsByIdApiResponse,
      DeleteApiV1ChartOfAccountsByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/chart-of-accounts/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    getApiV1Dashboard: build.query<
      GetApiV1DashboardApiResponse,
      GetApiV1DashboardApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/dashboard`,
        params: {
          Period: queryArg.period,
        },
      }),
    }),
    getHealth: build.query<GetHealthApiResponse, GetHealthApiArg>({
      query: () => ({ url: `/health` }),
    }),
    getApiV1Health: build.query<
      GetApiV1HealthApiResponse,
      GetApiV1HealthApiArg
    >({
      query: () => ({ url: `/api/v1/health` }),
    }),
    getApiV1JournalEntryById: build.query<
      GetApiV1JournalEntryByIdApiResponse,
      GetApiV1JournalEntryByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/journal-entry/${queryArg.id}` }),
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
    }),
    deleteApiV1JournalEntryDeleteById: build.mutation<
      DeleteApiV1JournalEntryDeleteByIdApiResponse,
      DeleteApiV1JournalEntryDeleteByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/journal-entry/delete/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    getApiV1JournalEntrySearchDescriptions: build.query<
      GetApiV1JournalEntrySearchDescriptionsApiResponse,
      GetApiV1JournalEntrySearchDescriptionsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/journal-entry/search-descriptions`,
        params: {
          Q: queryArg.q,
        },
      }),
    }),
    getApiV1JournalEntryNextTransactionNumber: build.query<
      GetApiV1JournalEntryNextTransactionNumberApiResponse,
      GetApiV1JournalEntryNextTransactionNumberApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/journal-entry/next-transaction-number`,
        params: {
          JournalType: queryArg.journalType,
          EntryDate: queryArg.entryDate,
        },
      }),
    }),
    getApiV1Notifications: build.query<
      GetApiV1NotificationsApiResponse,
      GetApiV1NotificationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/notifications`,
        params: {
          Limit: queryArg.limit,
        },
      }),
    }),
    putApiV1NotificationsByIdRead: build.mutation<
      PutApiV1NotificationsByIdReadApiResponse,
      PutApiV1NotificationsByIdReadApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/notifications/${queryArg.id}/read`,
        method: "PUT",
      }),
    }),
    putApiV1NotificationsReadAll: build.mutation<
      PutApiV1NotificationsReadAllApiResponse,
      PutApiV1NotificationsReadAllApiArg
    >({
      query: () => ({ url: `/api/v1/notifications/read-all`, method: "PUT" }),
    }),
    getApiV1Periods: build.query<
      GetApiV1PeriodsApiResponse,
      GetApiV1PeriodsApiArg
    >({
      query: () => ({ url: `/api/v1/periods` }),
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
    }),
    getApiV1PeriodsOpenInfo: build.query<
      GetApiV1PeriodsOpenInfoApiResponse,
      GetApiV1PeriodsOpenInfoApiArg
    >({
      query: () => ({ url: `/api/v1/periods/open-info` }),
    }),
    postApiV1PeriodsSelectById: build.mutation<
      PostApiV1PeriodsSelectByIdApiResponse,
      PostApiV1PeriodsSelectByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/periods/select/${queryArg.id}`,
        method: "POST",
      }),
    }),
    postApiV1PeriodsClearSelection: build.mutation<
      PostApiV1PeriodsClearSelectionApiResponse,
      PostApiV1PeriodsClearSelectionApiArg
    >({
      query: () => ({ url: `/api/v1/periods/clear-selection`, method: "POST" }),
    }),
    postApiV1PeriodsCloseById: build.mutation<
      PostApiV1PeriodsCloseByIdApiResponse,
      PostApiV1PeriodsCloseByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/periods/close/${queryArg.id}`,
        method: "POST",
      }),
    }),
    getApiV1Summary: build.query<
      GetApiV1SummaryApiResponse,
      GetApiV1SummaryApiArg
    >({
      query: () => ({ url: `/api/v1/Summary` }),
    }),
    putApiV1SettingsProfile: build.mutation<
      PutApiV1SettingsProfileApiResponse,
      PutApiV1SettingsProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/settings/profile`,
        method: "PUT",
        body: queryArg.updateProfileRequest,
      }),
    }),
    postApiV1SettingsAvatar: build.mutation<
      PostApiV1SettingsAvatarApiResponse,
      PostApiV1SettingsAvatarApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/settings/avatar`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    postApiV1SettingsChangePassword: build.mutation<
      PostApiV1SettingsChangePasswordApiResponse,
      PostApiV1SettingsChangePasswordApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/settings/change-password`,
        method: "POST",
        body: queryArg.changePasswordRequest,
      }),
    }),
    deleteApiV1SettingsDeleteAccount: build.mutation<
      DeleteApiV1SettingsDeleteAccountApiResponse,
      DeleteApiV1SettingsDeleteAccountApiArg
    >({
      query: () => ({
        url: `/api/v1/settings/delete-account`,
        method: "DELETE",
      }),
    }),
    getApiV1SettingsGuardianDashboard: build.query<
      GetApiV1SettingsGuardianDashboardApiResponse,
      GetApiV1SettingsGuardianDashboardApiArg
    >({
      query: () => ({ url: `/api/v1/settings/guardian/dashboard` }),
    }),
    postApiV1SettingsGuardianRevokeSessionBySessionId: build.mutation<
      PostApiV1SettingsGuardianRevokeSessionBySessionIdApiResponse,
      PostApiV1SettingsGuardianRevokeSessionBySessionIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/settings/guardian/revoke-session/${queryArg.sessionId}`,
        method: "POST",
      }),
    }),
    postApiV1SettingsGuardianRevokeAllSessions: build.mutation<
      PostApiV1SettingsGuardianRevokeAllSessionsApiResponse,
      PostApiV1SettingsGuardianRevokeAllSessionsApiArg
    >({
      query: () => ({
        url: `/api/v1/settings/guardian/revoke-all-sessions`,
        method: "POST",
      }),
    }),
    getApiV1ToolsDownloadJournalTemplate: build.query<
      GetApiV1ToolsDownloadJournalTemplateApiResponse,
      GetApiV1ToolsDownloadJournalTemplateApiArg
    >({
      query: () => ({ url: `/api/v1/tools/download-journal-template` }),
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
    }),
    getApiV1ReportsIncomeStatement: build.query<
      GetApiV1ReportsIncomeStatementApiResponse,
      GetApiV1ReportsIncomeStatementApiArg
    >({
      query: () => ({ url: `/api/v1/reports/income-statement` }),
    }),
    getApiV1ReportsRetainedEarnings: build.query<
      GetApiV1ReportsRetainedEarningsApiResponse,
      GetApiV1ReportsRetainedEarningsApiArg
    >({
      query: () => ({ url: `/api/v1/reports/retained-earnings` }),
    }),
    getApiV1ReportsStatementOfCashFlow: build.query<
      GetApiV1ReportsStatementOfCashFlowApiResponse,
      GetApiV1ReportsStatementOfCashFlowApiArg
    >({
      query: () => ({ url: `/api/v1/reports/statement-of-cash-flow` }),
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
    }),
    getApiV1ReportsGeneralLedgersPermanent: build.query<
      GetApiV1ReportsGeneralLedgersPermanentApiResponse,
      GetApiV1ReportsGeneralLedgersPermanentApiArg
    >({
      query: () => ({ url: `/api/v1/reports/general-ledgers/permanent` }),
    }),
    getApiV1ReportsGeneralLedgersTemporary: build.query<
      GetApiV1ReportsGeneralLedgersTemporaryApiResponse,
      GetApiV1ReportsGeneralLedgersTemporaryApiArg
    >({
      query: () => ({ url: `/api/v1/reports/general-ledgers/temporary` }),
    }),
    postApiV1ReportsGeneralLedgersRefresh: build.mutation<
      PostApiV1ReportsGeneralLedgersRefreshApiResponse,
      PostApiV1ReportsGeneralLedgersRefreshApiArg
    >({
      query: () => ({
        url: `/api/v1/reports/general-ledgers/refresh`,
        method: "POST",
      }),
    }),
    getApiV1ReportsJournalsGeneral: build.query<
      GetApiV1ReportsJournalsGeneralApiResponse,
      GetApiV1ReportsJournalsGeneralApiArg
    >({
      query: () => ({ url: `/api/v1/reports/journals/general` }),
    }),
    getApiV1ReportsJournalsAdjusting: build.query<
      GetApiV1ReportsJournalsAdjustingApiResponse,
      GetApiV1ReportsJournalsAdjustingApiArg
    >({
      query: () => ({ url: `/api/v1/reports/journals/adjusting` }),
    }),
    getApiV1ReportsJournalsClosing: build.query<
      GetApiV1ReportsJournalsClosingApiResponse,
      GetApiV1ReportsJournalsClosingApiArg
    >({
      query: () => ({ url: `/api/v1/reports/journals/closing` }),
    }),
    deleteApiV1ReportsJournalsAdjustingById: build.mutation<
      DeleteApiV1ReportsJournalsAdjustingByIdApiResponse,
      DeleteApiV1ReportsJournalsAdjustingByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/reports/journals/adjusting/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    getApiV1ReportsTrialBalances: build.query<
      GetApiV1ReportsTrialBalancesApiResponse,
      GetApiV1ReportsTrialBalancesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/reports/trial-balances`,
        params: {
          type: queryArg["type"],
        },
      }),
    }),
    getApiV1ReportsWorksheet: build.query<
      GetApiV1ReportsWorksheetApiResponse,
      GetApiV1ReportsWorksheetApiArg
    >({
      query: () => ({ url: `/api/v1/reports/worksheet` }),
    }),
    getApiV1Kurs: build.query<GetApiV1KursApiResponse, GetApiV1KursApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/kurs`,
        params: {
          BaseCurrency: queryArg.baseCurrency,
          TargetCurrency: queryArg.targetCurrency,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type $getApiResponse = unknown;
export type $getApiArg = void;
export type HeadApiResponse = unknown;
export type HeadApiArg = void;
export type GetApiV1HomeMarketIndicatorsApiResponse = unknown;
export type GetApiV1HomeMarketIndicatorsApiArg = void;
export type PostApiV1AuthLoginApiResponse = unknown;
export type PostApiV1AuthLoginApiArg = {
  loginRequest: LoginRequest;
};
export type PostApiV1AuthGoogleLoginApiResponse = unknown;
export type PostApiV1AuthGoogleLoginApiArg = {
  googleLoginRequest: GoogleLoginRequest;
};
export type GetApiV1AuthGoogleLoginApiResponse = unknown;
export type GetApiV1AuthGoogleLoginApiArg = {
  redirectTo?: string;
};
export type GetApiV1AuthGoogleCallbackApiResponse = unknown;
export type GetApiV1AuthGoogleCallbackApiArg = {
  redirectTo?: string;
  remoteError?: string;
};
export type GetApiV1AuthMeApiResponse = unknown;
export type GetApiV1AuthMeApiArg = void;
export type PostApiV1AuthLogoutApiResponse = unknown;
export type PostApiV1AuthLogoutApiArg = void;
export type GetApiV1AvatarsByFileNameApiResponse = unknown;
export type GetApiV1AvatarsByFileNameApiArg = {
  fileName: string;
};
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
export type GetHealthApiResponse = unknown;
export type GetHealthApiArg = void;
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
export type GetApiV1NotificationsApiResponse = unknown;
export type GetApiV1NotificationsApiArg = {
  limit?: number;
};
export type PutApiV1NotificationsByIdReadApiResponse = unknown;
export type PutApiV1NotificationsByIdReadApiArg = {
  id: string;
};
export type PutApiV1NotificationsReadAllApiResponse = unknown;
export type PutApiV1NotificationsReadAllApiArg = void;
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
export type GetApiV1SummaryApiResponse = unknown;
export type GetApiV1SummaryApiArg = void;
export type PutApiV1SettingsProfileApiResponse = unknown;
export type PutApiV1SettingsProfileApiArg = {
  updateProfileRequest: UpdateProfileRequest;
};
export type PostApiV1SettingsAvatarApiResponse = unknown;
export type PostApiV1SettingsAvatarApiArg = {
  body: {
    ContentType?: string;
    ContentDisposition?: string;
    Headers?: {
      [key: string]: string[];
    };
    Length?: number;
    Name?: string;
    FileName?: string;
  } & {
    ContentType?: string;
    ContentDisposition?: string;
    Headers?: {
      [key: string]: string[];
    };
    Length?: number;
    Name?: string;
    FileName?: string;
  };
};
export type PostApiV1SettingsChangePasswordApiResponse = unknown;
export type PostApiV1SettingsChangePasswordApiArg = {
  changePasswordRequest: ChangePasswordRequest;
};
export type DeleteApiV1SettingsDeleteAccountApiResponse = unknown;
export type DeleteApiV1SettingsDeleteAccountApiArg = void;
export type GetApiV1SettingsGuardianDashboardApiResponse = unknown;
export type GetApiV1SettingsGuardianDashboardApiArg = void;
export type PostApiV1SettingsGuardianRevokeSessionBySessionIdApiResponse =
  unknown;
export type PostApiV1SettingsGuardianRevokeSessionBySessionIdApiArg = {
  sessionId: string;
};
export type PostApiV1SettingsGuardianRevokeAllSessionsApiResponse = unknown;
export type PostApiV1SettingsGuardianRevokeAllSessionsApiArg = void;
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
export type GetApiV1ReportsGeneralLedgersPermanentApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgersPermanentApiArg = void;
export type GetApiV1ReportsGeneralLedgersTemporaryApiResponse = unknown;
export type GetApiV1ReportsGeneralLedgersTemporaryApiArg = void;
export type PostApiV1ReportsGeneralLedgersRefreshApiResponse = unknown;
export type PostApiV1ReportsGeneralLedgersRefreshApiArg = void;
export type GetApiV1ReportsJournalsGeneralApiResponse = unknown;
export type GetApiV1ReportsJournalsGeneralApiArg = void;
export type GetApiV1ReportsJournalsAdjustingApiResponse = unknown;
export type GetApiV1ReportsJournalsAdjustingApiArg = void;
export type GetApiV1ReportsJournalsClosingApiResponse = unknown;
export type GetApiV1ReportsJournalsClosingApiArg = void;
export type DeleteApiV1ReportsJournalsAdjustingByIdApiResponse = unknown;
export type DeleteApiV1ReportsJournalsAdjustingByIdApiArg = {
  id: number;
};
export type GetApiV1ReportsTrialBalancesApiResponse = unknown;
export type GetApiV1ReportsTrialBalancesApiArg = {
  type?: string;
};
export type GetApiV1ReportsWorksheetApiResponse = unknown;
export type GetApiV1ReportsWorksheetApiArg = void;
export type GetApiV1KursApiResponse = unknown;
export type GetApiV1KursApiArg = {
  baseCurrency?: string;
  targetCurrency?: string;
};
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
  referenceNumber?: number;
  accountName?: string;
  type?: string;
  role?: string;
};
export type UpdateAccountRequest = {
  referenceNumber?: number;
  accountName?: string;
  type?: string;
  role?: string;
  isActive?: boolean;
};
export type JournalEntryLineDto = {
  accountId?: number;
  lineDescription?: string;
  debit?: number;
  credit?: number;
  lineOrder?: number;
};
export type CreateJournalEntryRequest = {
  journalType?: string;
  entryDate?: string;
  createdAt?: string;
  lines?: JournalEntryLineDto[];
};
export type UpdateJournalEntryRequest = {
  journalType?: string;
  entryDate?: string;
  updatedAt?: string;
  lines?: JournalEntryLineDto[];
};
export type CreatePeriodRequest = {
  month?: number;
  year?: number;
  setupMode?: string;
  cashAccountId?: null | number;
  bankAccountId?: null | number;
  retainedEarningsAccountId?: null | number;
  cashAccountCode?: null | string;
  cashAccountName?: null | string;
  cashBalance?: null | number;
  bankAccountCode?: null | string;
  bankAccountName?: null | string;
  bankBalance?: null | number;
  retainedEarningsAccountCode?: null | string;
  retainedEarningsAccountName?: null | string;
};
export type UpdateProfileRequest = {
  fullName?: null | string;
  userName?: null | string;
  phoneNumber?: null | string;
  bio?: null | string;
  avatarUrl?: null | string;
};
export type ChangePasswordRequest = {
  currentPassword?: string;
  newPassword?: string;
};
export type JournalLineDto = {
  refNumber?: number;
  accountName?: string;
  description?: string;
  debit?: null | number;
  credit?: null | number;
};
export type JournalTransactionDto = {
  transactionNumber?: string;
  date?: string;
  journalType?: string;
  lines?: JournalLineDto[];
};
export type AccountMappingDetailDto = {
  excelRef?: number;
  excelAccountName?: string;
  mappedRef?: number;
  mappedAccountName?: string;
  status?: string;
  reason?: string;
};
export type JournalImportRequestDto = {
  targetYear?: number;
  targetMonth?: number;
  transactions?: JournalTransactionDto[];
  customMappings?: null | AccountMappingDetailDto[];
};
export const {
  use$getQuery,
  useHeadMutation,
  useGetApiV1HomeMarketIndicatorsQuery,
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  useGetApiV1AuthGoogleLoginQuery,
  useGetApiV1AuthGoogleCallbackQuery,
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
  useGetApiV1AvatarsByFileNameQuery,
  useGetApiV1ChartOfAccountsQuery,
  usePostApiV1ChartOfAccountsMutation,
  usePutApiV1ChartOfAccountsByIdMutation,
  useDeleteApiV1ChartOfAccountsByIdMutation,
  useGetApiV1DashboardQuery,
  useGetHealthQuery,
  useGetApiV1HealthQuery,
  useGetApiV1JournalEntryByIdQuery,
  usePostApiV1JournalEntryCreateMutation,
  usePutApiV1JournalEntryEditByIdMutation,
  useDeleteApiV1JournalEntryDeleteByIdMutation,
  useGetApiV1JournalEntrySearchDescriptionsQuery,
  useGetApiV1JournalEntryNextTransactionNumberQuery,
  useGetApiV1NotificationsQuery,
  usePutApiV1NotificationsByIdReadMutation,
  usePutApiV1NotificationsReadAllMutation,
  useGetApiV1PeriodsQuery,
  usePostApiV1PeriodsMutation,
  useGetApiV1PeriodsOpenInfoQuery,
  usePostApiV1PeriodsSelectByIdMutation,
  usePostApiV1PeriodsClearSelectionMutation,
  usePostApiV1PeriodsCloseByIdMutation,
  useGetApiV1SummaryQuery,
  usePutApiV1SettingsProfileMutation,
  usePostApiV1SettingsAvatarMutation,
  usePostApiV1SettingsChangePasswordMutation,
  useDeleteApiV1SettingsDeleteAccountMutation,
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
  useGetApiV1ToolsDownloadJournalTemplateQuery,
  usePostApiV1ToolsPreviewJournalImportMutation,
  usePostApiV1ToolsImportJournalEntriesMutation,
  useGetApiV1ReportsIncomeStatementQuery,
  useGetApiV1ReportsRetainedEarningsQuery,
  useGetApiV1ReportsStatementOfCashFlowQuery,
  useGetApiV1ReportsStatementOfFinancialPositionQuery,
  useGetApiV1ReportsGeneralLedgersPermanentQuery,
  useGetApiV1ReportsGeneralLedgersTemporaryQuery,
  usePostApiV1ReportsGeneralLedgersRefreshMutation,
  useGetApiV1ReportsJournalsGeneralQuery,
  useGetApiV1ReportsJournalsAdjustingQuery,
  useGetApiV1ReportsJournalsClosingQuery,
  useDeleteApiV1ReportsJournalsAdjustingByIdMutation,
  useGetApiV1ReportsTrialBalancesQuery,
  useGetApiV1ReportsWorksheetQuery,
  useGetApiV1KursQuery,
} = injectedRtkApi;
