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
  // WAJIB: Mengirim cookie 'AumoFinance.Session' saat request di Browser Client
  credentials: "include",
  prepareHeaders: async (headers) => {
    // Meneruskan Cookie jika request dieksekusi di Next.js Server (SSR)
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        if (cookieHeader) {
          // Gunakan 'Cookie' dengan huruf C kapital agar terbaca sempurna oleh ASP.NET Core
          headers.set("Cookie", cookieHeader);
        }
      } catch {
        // Safe fallback jika dipanggil saat build-time / static site generation
      }
    }
    return headers;
  },
});

/**
 * Interceptor Global 401 Unauthorized
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Jika 401 terjadi di Browser (Client-Side), redirect ke login
  if (
    result.error &&
    result.error.status === 401 &&
    typeof window !== "undefined"
  ) {
    const currentPath = window.location.pathname;

    if (!currentPath.startsWith("/auth") && currentPath !== "/") {
      window.location.href = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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
