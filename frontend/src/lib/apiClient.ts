import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
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
  // WAJIB: Memaksa browser mengirimkan Cookie SameSite=None/Secure ke Render
  credentials: "include",
  prepareHeaders: async (headers) => {
    // Meneruskan Cookie dari Browser pengguna saat Next.js melakukan Server-Side Rendering (SSR)
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        if (cookieHeader) {
          headers.set("cookie", cookieHeader);
        }
      } catch {
        // Safe fallback jika dipanggil di luar konteks HTTP Request Next.js
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

  // Jika response 401 Unauthorized di sisi Browser Client, arahkan ke halaman login
  if (result.error && result.error.status === 401 && typeof window !== "undefined") {
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
