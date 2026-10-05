import { baseApi } from "@/lib/apiClient";

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
  availableCashAndBankAccounts?: Array<{ id: number; name: string; code: string }>;
  availableRetainedEarningsAccounts?: Array<{ id: number; name: string; code: string }>;
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

export const periodsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/periods
    getPeriods: builder.query<PeriodItem[] | { items: PeriodItem[] }, void>({
      query: () => "/api/v1/periods",
      providesTags: ["Periods"],
    }),

    // GET /api/v1/periods/open-info
    getPeriodsOpenInfo: builder.query<PeriodsOpenInfo, void>({
      query: () => "/api/v1/periods/open-info",
      providesTags: ["Periods"],
    }),

    // POST /api/v1/periods
    createPeriod: builder.mutation<void, { createPeriodRequest: CreatePeriodRequest }>({
      query: ({ createPeriodRequest }) => ({
        url: "/api/v1/periods",
        method: "POST",
        body: createPeriodRequest,
      }),
      invalidatesTags: ["Periods"],
    }),

    // POST /api/v1/periods/{id}/select
    selectPeriod: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/api/v1/periods/${id}/select`,
        method: "POST",
      }),
      invalidatesTags: ["Periods"],
    }),

    // POST /api/v1/periods/clear-selection
    clearSelection: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/periods/clear-selection",
        method: "POST",
      }),
      invalidatesTags: ["Periods"],
    }),

    // POST /api/v1/periods/{id}/close
    closePeriod: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/api/v1/periods/${id}/close`,
        method: "POST",
      }),
      invalidatesTags: ["Periods"],
    }),
  }),
});