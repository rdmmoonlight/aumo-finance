import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["Dashboard"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type GetApiV1DashboardApiResponse = unknown;
export type GetApiV1DashboardApiArg = {
  period?: string;
};
export const { useGetApiV1DashboardQuery } = injectedRtkApi;
