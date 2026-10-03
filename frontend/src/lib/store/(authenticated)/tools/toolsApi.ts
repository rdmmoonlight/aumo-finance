import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["Tools"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1ToolsDownloadJournalTemplate: build.query<
        GetApiV1ToolsDownloadJournalTemplateApiResponse,
        GetApiV1ToolsDownloadJournalTemplateApiArg
      >({
        query: () => ({ url: `/api/v1/tools/download-journal-template` }),
        providesTags: ["Tools"],
      }),
      postApiV1ToolsPreviewJournalImport: build.mutation<
        PostApiV1ToolsPreviewJournalImportApiResponse,
        PostApiV1ToolsPreviewJournalImportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/tools/preview-journal-import`,
          method: "POST",
          body: queryArg.journalImportRequestDto,
        }),
        invalidatesTags: ["Tools"],
      }),
      postApiV1ToolsImportJournalEntries: build.mutation<
        PostApiV1ToolsImportJournalEntriesApiResponse,
        PostApiV1ToolsImportJournalEntriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/tools/import-journal-entries`,
          method: "POST",
          body: queryArg.journalImportRequestDto,
        }),
        invalidatesTags: ["Tools"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type GetApiV1ToolsDownloadJournalTemplateApiResponse = unknown;
export type GetApiV1ToolsDownloadJournalTemplateApiArg = void;
export type PostApiV1ToolsPreviewJournalImportApiResponse = unknown;
export type PostApiV1ToolsPreviewJournalImportApiArg = {
  journalImportRequestDto: JournalImportRequestDto;
};
export type PostApiV1ToolsImportJournalEntriesApiResponse = unknown;
export type PostApiV1ToolsImportJournalEntriesApiArg = {
  journalImportRequestDto: JournalImportRequestDto;
};
export type JournalLineDto = {
  refNumber?: number | string;
  accountName?: string;
  description?: string;
  debit?: null | number | string;
  credit?: null | number | string;
};
export type JournalTransactionDto = {
  transactionNumber?: string;
  date?: string;
  journalType?: string;
  lines?: JournalLineDto[];
};
export type AccountMappingDetailDto = {
  excelRef?: number | string;
  excelAccountName?: string;
  mappedRef?: number | string;
  mappedAccountName?: string;
  status?: string;
  reason?: string;
};
export type JournalImportRequestDto = {
  targetYear?: number | string;
  targetMonth?: number | string;
  transactions?: JournalTransactionDto[];
  customMappings?: null | AccountMappingDetailDto[];
};
export const {
  useGetApiV1ToolsDownloadJournalTemplateQuery,
  usePostApiV1ToolsPreviewJournalImportMutation,
  usePostApiV1ToolsImportJournalEntriesMutation,
} = injectedRtkApi;
