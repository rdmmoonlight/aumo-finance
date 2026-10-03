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
      getApiV1HomeMarketIndicators: build.query<
        GetApiV1HomeMarketIndicatorsApiResponse,
        GetApiV1HomeMarketIndicatorsApiArg
      >({
        query: () => ({ url: `/api/v1/home/market-indicators` }),
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
export type GetApiV1HomeMarketIndicatorsApiResponse = unknown;
export type GetApiV1HomeMarketIndicatorsApiArg = void;
export const { useGetApiV1KursQuery, useGetApiV1HomeMarketIndicatorsQuery } =
  injectedRtkApi;
