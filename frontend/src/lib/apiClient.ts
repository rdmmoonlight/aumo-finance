// src/lib/apiClient.ts
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

function getBackendTarget(): string {
  let target =
    process.env.NEXT_PUBLIC_WEB_API_URL ||
    process.env.WEB_API_URL ||
    "http://localhost:5000";

  // Paksa HTTPS jika menembak server remote (Production / Render)
  if (
    !target.includes("localhost") &&
    !target.includes("127.0.0.1") &&
    target.startsWith("http://")
  ) {
    target = target.replace("http://", "https://");
  }

  // Hapus trailing slash di akhir agar tidak bentrok dengan endpoint yang diawali '/'
  return target.replace(/\/+$/, "");
}

const BASE_URL = getBackendTarget();

export const API_BASE_URL = BASE_URL;
export const getApiBaseUrl = () => BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: async (headers, { arg }) => {
    // SSR: forward cookies dari server secara dinamis (Hanya di server context)
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();
        if (cookieHeader) {
          headers.set("Cookie", cookieHeader);
        }
      } catch {
        // Mengabaikan error jika dipanggil di luar konteks request server Next.js
      }
    }

    // Biarkan browser menentukan Content-Type & boundary secara otomatis jika mengirim FormData
    const fetchArgs = arg as FetchArgs;
    if (
      fetchArgs &&
      typeof fetchArgs !== "string" &&
      fetchArgs.body instanceof FormData
    ) {
      headers.delete("Content-Type");
      headers.delete("content-type");
    }

    return headers;
  },
});

let isRedirecting = false;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = typeof args === "string" ? args : args.url;

  // --- EKSPLISIT VALIDASI: Wajib diawali dengan slash `/` ---
  if (!requestUrl || !requestUrl.startsWith("/")) {
    throw new Error(
      `[RTK Query Route Error]: Route "${requestUrl}" wajib diawali dengan slash '/'. Mohon perbaiki penulisan endpoint pada slice API tempat permintaan ini dipanggil.`
    );
  }

  // Clone args tanpa memutasi argumen asli jika berbentuk object dan menggunakan FormData
  let adjustedArgs = args;
  if (
    typeof args !== "string" &&
    args.body instanceof FormData &&
    args.headers
  ) {
    let headersEntries: [string, string][] = [];

    if (args.headers instanceof Headers) {
      args.headers.forEach((value, key) => {
        headersEntries.push([key, value]);
      });
    } else if (Array.isArray(args.headers)) {
      headersEntries = (args.headers as string[][]).map(([k, v]) => [
        k,
        v ?? "",
      ]);
    } else if (typeof args.headers === "object") {
      headersEntries = Object.entries(args.headers as Record<string, string>);
    }

    const newHeaders = new Headers(headersEntries);
    newHeaders.delete("Content-Type");
    newHeaders.delete("content-type");

    adjustedArgs = {
      ...args,
      headers: newHeaders,
    };
  }

  const result = await rawBaseQuery(adjustedArgs, api, extraOptions);

  // Penanganan Unauthenticated (401) di sisi client
  if (
    result.error &&
    result.error.status === 401 &&
    typeof window !== "undefined"
  ) {
    const currentPath = window.location.pathname;
    if (
      !currentPath.startsWith("/auth") &&
      currentPath !== "/" &&
      !isRedirecting
    ) {
      isRedirecting = true;
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
    "Auth",
    "Coa",
    "ChartOfAccounts",
    "Journal",
    "JournalEntry",
    "Periods",
    "Dashboard",
    "Reports",
    "Settings",
    "Tools",
    "Notifications",
    "Summary",
    "FinancialStatements",
    "GeneralLedgers",
    "Worksheet",
    "MarketData",
    "AumoBackend",
    "Health",
  ],
  endpoints: () => ({}),
});