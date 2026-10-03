import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["MarketData"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1Kurs: build.query<GetApiV1KursApiResponse, GetApiV1KursApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/kurs`,
          params: {
            baseCurrency: queryArg.baseCurrency,
            targetCurrency: queryArg.targetCurrency,
          },
        }),
        providesTags: ["MarketData"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type GetApiV1KursApiResponse = unknown;
export type GetApiV1KursApiArg = {
  baseCurrency?: string;
  targetCurrency?: string;
};
export const { useGetApiV1KursQuery } = injectedRtkApi;
