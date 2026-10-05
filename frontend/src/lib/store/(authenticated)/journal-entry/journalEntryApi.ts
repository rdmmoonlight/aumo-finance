// src/lib/store/(authenticated)/journal-entry/journalEntryApi.ts
import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response ---
export interface JournalEntryLineDto {
  accountId?: number | string;
  lineDescription?: string;
  debit?: number | string;
  credit?: number | string;
  lineOrder?: number | string;
}

export interface CreateJournalEntryRequest {
  journalType?: string;
  entryDate?: string;
  createdAt?: string;
  lines?: JournalEntryLineDto[];
}

export interface UpdateJournalEntryRequest {
  transactionNumber?: string;
  journalType?: string;
  entryDate?: string;
  updatedAt?: string;
  lines?: JournalEntryLineDto[];
}

export interface GetJournalEntryByIdArg {
  id: number;
}

export interface EditJournalEntryArg {
  id: number;
  body: UpdateJournalEntryRequest;
}

export interface SearchDescriptionsArg {
  q?: string;
}

export interface NextTransactionNumberArg {
  journalType?: string;
  entryDate?: string;
}

// --- Inject Endpoints ---
export const journalEntryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/journal-entry/{id}
    getJournalEntryById: builder.query<any, GetJournalEntryByIdArg>({
      query: ({ id }) => ({
        url: `/api/v1/journal-entry/${id}`,
      }),
      providesTags: ["JournalEntry"],
    }),

    // POST /api/v1/journal-entry/create
    createJournalEntry: builder.mutation<any, CreateJournalEntryRequest>({
      query: (body) => ({
        url: `/api/v1/journal-entry/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["JournalEntry"],
    }),

    // PUT /api/v1/journal-entry/edit/{id}
    editJournalEntry: builder.mutation<any, EditJournalEntryArg>({
      query: ({ id, body }) => ({
        url: `/api/v1/journal-entry/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["JournalEntry"],
    }),

    // DELETE /api/v1/journal-entry/delete/{id}
    deleteJournalEntry: builder.mutation<any, number>({
      query: (id) => ({
        url: `/api/v1/journal-entry/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JournalEntry"],
    }),

    // GET /api/v1/journal-entry/search-descriptions
    searchDescriptions: builder.query<any, SearchDescriptionsArg>({
      query: (params) => ({
        url: `/api/v1/journal-entry/search-descriptions`,
        params,
      }),
      providesTags: ["JournalEntry"],
    }),

    // GET /api/v1/journal-entry/next-transaction-number
    getNextTransactionNumber: builder.query<any, NextTransactionNumberArg>({
      query: (params) => ({
        url: `/api/v1/journal-entry/next-transaction-number`,
        params,
      }),
      providesTags: ["JournalEntry"],
    }),
  }),
});