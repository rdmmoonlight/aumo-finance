import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response ---
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

export type GetChartOfAccountsArg = {
  search?: string;
  category?: string;
};

export type PutChartOfAccountsByIdArg = {
  id: number | string;
  updateAccountRequest: UpdateAccountRequest;
};

export type DeleteChartOfAccountsByIdArg = {
  id: number | string;
};

// --- Inject Endpoints ---
export const chartOfAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/chart-of-accounts
    getChartOfAccounts: builder.query<any, GetChartOfAccountsArg | void>({
      query: (arg) => ({
        url: "/api/v1/chart-of-accounts",
        params: arg
          ? {
              search: arg.search,
              category: arg.category,
            }
          : undefined,
      }),
      providesTags: ["ChartOfAccounts"],
    }),

    // POST /api/v1/chart-of-accounts
    createChartOfAccount: builder.mutation<any, CreateAccountRequest>({
      query: (body) => ({
        url: "/api/v1/chart-of-accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChartOfAccounts"],
    }),

    // PUT /api/v1/chart-of-accounts/{id}
    updateChartOfAccount: builder.mutation<any, PutChartOfAccountsByIdArg>({
      query: ({ id, updateAccountRequest }) => ({
        url: `/api/v1/chart-of-accounts/${id}`,
        method: "PUT",
        body: updateAccountRequest,
      }),
      invalidatesTags: ["ChartOfAccounts"],
    }),

    // DELETE /api/v1/chart-of-accounts/{id}
    deleteChartOfAccount: builder.mutation<any, DeleteChartOfAccountsByIdArg>({
      query: ({ id }) => ({
        url: `/api/v1/chart-of-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChartOfAccounts"],
    }),
  }),
});