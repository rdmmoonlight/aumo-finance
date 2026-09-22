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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: async (headers) => {
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();
        if (cookieHeader) headers.set("Cookie", cookieHeader);
      } catch {
        // Fallback saat build-time
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // PENTING: Hanya lakukan redirect SEKALI di browser jika 401
  if (
    result.error &&
    result.error.status === 401 &&
    typeof window !== "undefined"
  ) {
    const currentPath = window.location.pathname;

    // Pastikan HANYA redirect jika BELUM di /auth agar tidak loop
    if (!currentPath.startsWith("/auth") && currentPath !== "/") {
      // Gunakan window.location.replace agar tidak menyimpan history loop
      window.location.replace(
        `/auth?redirectTo=${encodeURIComponent(currentPath)}`,
      );
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Matikan refetch pada fokus jendela untuk mencegah spam saat tab aktif/inaktif
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
