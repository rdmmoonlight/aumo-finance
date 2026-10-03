import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["Periods"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
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
export type CreatePeriodRequest = {
  month?: number | string;
  year?: number | string;
  setupMode?: string;
  cashAccountId?: null | number | string;
  bankAccountId?: null | number | string;
  retainedEarningsAccountId?: null | number | string;
  cashAccountCode?: null | string;
  cashAccountName?: null | string;
  cashBalance?: null | number | string;
  bankAccountCode?: null | string;
  bankAccountName?: null | string;
  bankBalance?: null | number | string;
  retainedEarningsAccountCode?: null | string;
  retainedEarningsAccountName?: null | string;
};
export const {
  useGetApiV1PeriodsQuery,
  usePostApiV1PeriodsMutation,
  useGetApiV1PeriodsOpenInfoQuery,
  usePostApiV1PeriodsSelectByIdMutation,
  usePostApiV1PeriodsClearSelectionMutation,
  usePostApiV1PeriodsCloseByIdMutation,
} = injectedRtkApi;
