import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["JournalEntry"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
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
export type JournalEntryLineDto = {
  accountId?: number | string;
  lineDescription?: string;
  debit?: number | string;
  credit?: number | string;
  lineOrder?: number | string;
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
export const {
  useGetApiV1JournalEntryByIdQuery,
  usePostApiV1JournalEntryCreateMutation,
  usePutApiV1JournalEntryEditByIdMutation,
  useDeleteApiV1JournalEntryDeleteByIdMutation,
  useGetApiV1JournalEntrySearchDescriptionsQuery,
  useGetApiV1JournalEntryNextTransactionNumberQuery,
} = injectedRtkApi;
