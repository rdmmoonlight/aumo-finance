import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["ChartOfAccounts"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
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
export const {
  useGetApiV1ChartOfAccountsQuery,
  usePostApiV1ChartOfAccountsMutation,
  usePutApiV1ChartOfAccountsByIdMutation,
  useDeleteApiV1ChartOfAccountsByIdMutation,
} = injectedRtkApi;
