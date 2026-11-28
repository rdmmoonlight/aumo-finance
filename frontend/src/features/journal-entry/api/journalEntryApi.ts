import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response ---
export interface JournalEntryLineDto {
  accountId: number;
  lineDescription?: string;
  debit: number;
  credit: number;
  lineOrder?: number;
}

export interface CreateJournalEntryRequest {
  journalType: string;
  entryDate: string;
  lines: JournalEntryLineDto[];
}

export interface UpdateJournalEntryRequest {
  transactionNumber?: string;
  journalType: string;
  entryDate: string;
  lines: JournalEntryLineDto[];
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
    // GET /journal-entry/{id}
    getJournalEntryById: builder.query<any, GetJournalEntryByIdArg>({
      query: ({ id }) => ({
        url: `/journal-entry/${id}`,
      }),
      providesTags: (result, error, { id }) => [{ type: "JournalEntry", id }],
    }),

    // POST /journal-entry/create
    createJournalEntry: builder.mutation<any, CreateJournalEntryRequest>({
      query: (body) => ({
        url: `/journal-entry/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["JournalEntry"],
    }),

    // PUT /journal-entry/edit/{id}
    editJournalEntry: builder.mutation<any, EditJournalEntryArg>({
      query: ({ id, body }) => ({
        url: `/journal-entry/edit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "JournalEntry",
        { type: "JournalEntry", id },
      ],
    }),

    // DELETE /journal-entry/delete/{id}
    deleteJournalEntry: builder.mutation<any, number>({
      query: (id) => ({
        url: `/journal-entry/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JournalEntry"],
    }),

    // GET /journal-entry/search-descriptions
    searchDescriptions: builder.query<any, SearchDescriptionsArg>({
      query: (params) => ({
        url: `/journal-entry/search-descriptions`,
        params,
      }),
      providesTags: ["JournalEntry"],
    }),

    // GET /journal-entry/next-transaction-number
    getNextTransactionNumber: builder.query<any, NextTransactionNumberArg>({
      query: (params) => ({
        url: `/journal-entry/next-transaction-number`,
        params,
      }),
      providesTags: ["JournalEntry"],
    }),
  }),
});

// --- Export Auto-Generated Hooks ---
export const {
  useGetJournalEntryByIdQuery,
  useCreateJournalEntryMutation,
  useEditJournalEntryMutation,
  useDeleteJournalEntryMutation,
  useSearchDescriptionsQuery,
  useGetNextTransactionNumberQuery,
} = journalEntryApi;
