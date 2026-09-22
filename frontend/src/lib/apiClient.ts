import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { aumoConfig } from "../../aumo.config";

/**
 * Normalisasi URL agar wajib menggunakan HTTPS untuk koneksi luar.
 * Diperlukan untuk keamanan SameSite=None cookie pada Next.js / Browser.
 */
function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

const BASE_URL = enforceHttps(aumoConfig.backendTarget);

// Raw Base Query bawaan RTK Query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // WAJIB: Mengirim cookie 'AumoFinance.Session' (.NET Identity) pada request Client-Side
  credentials: "include",
  prepareHeaders: async (headers) => {
    // Penanganan SSR Cookie untuk Next.js App Router saat dijalankan di server-side
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        if (cookieHeader) {
          headers.set("cookie", cookieHeader);
        }
      } catch {
        // Safe fallback jika dieksekusi di luar konteks HTTP Request Next.js (misal: build time)
      }
    }
    return headers;
  },
});

/**
 * Custom Base Query dengan Interceptor 401 Unauthorized Global
 * Menggantikan perilaku Axios Interceptor terdahulu.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Jika response 401 Unauthorized dan dieksekusi di sisi Browser (Client)
  if (result.error && result.error.status === 401 && typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    // Mencegah infinite loop redirect jika sudah berada di halaman /auth atau /
    if (!currentPath.startsWith("/auth") && currentPath !== "/") {
      const redirectUrl = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Durasi cache default (300 detik / 5 menit)
  keepUnusedDataFor: 300,
  // Daftar tagTypes diselaraskan dengan addTagTypes di generatedApi.ts
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
