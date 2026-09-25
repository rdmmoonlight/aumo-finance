// src/lib/apiClient.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { aumoConfig } from "../../aumo.config";

function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

const BASE_URL = enforceHttps(aumoConfig.backendTarget);

export const API_BASE_URL = BASE_URL;
export const getApiBaseUrl = () => BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: async (headers, { getState, endpoint, extra, type, forced, arg }) => {
    // SSR: forward cookies dari server
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();
        if (cookieHeader) headers.set("Cookie", cookieHeader);
      } catch {
      }
    }

    const fetchArgs = arg as FetchArgs;
    if (fetchArgs && typeof fetchArgs!== "string" && fetchArgs.body instanceof FormData) {
      headers.delete("Content-Type");
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (typeof args!== "string" && args.body instanceof FormData) {
    if (args.headers) {
      const h = args.headers as Record<string, string>;
      delete h["Content-Type"];
      delete h["content-type"];
    }
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    typeof window!== "undefined"
  ) {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/auth") && currentPath!== "/") {
      window.location.replace(
        `/auth?redirectTo=${encodeURIComponent(currentPath)}`
      );
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  keepUnusedDataFor: 300,
  tagTypes: [
    "AumoBackend",
    "Auth",
    "ChartOfAccounts",
    "Dashboard",
    "Guardian",
    "Health",
    "JournalEntry",
    "Periods",
    "Tools",
    "TestEmail",
    "GeneralLedger",
    "IncomeStatement",
    "Journal",
    "RetainedEarnings",
    "StatementOfCashFlow",
    "StatementOfFinancialPosition",
    "TrialBalance",
    "Worksheet",
  ],
  endpoints: () => ({}),
});
