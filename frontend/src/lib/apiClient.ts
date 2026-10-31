import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export function getBackendTarget(): string {
  // Di client pakai proxy /api/v1 -> biar lewat Next.js rewrite
  if (typeof window !== "undefined") {
    return "";
  }

  const target =
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_URL ||
    process.env.WEB_API_URL ||
    "http://127.0.0.1:5000";

  return target.replace(/\/+$/, "");
}

export const API_BASE_URL = getBackendTarget();
export const getApiBaseUrl = getBackendTarget;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${getBackendTarget()}/api/v1`,
  credentials: "include",
  prepareHeaders: (headers, { arg }) => {
    // Penting untuk upload file: biar browser set boundary otomatis
    const body = (arg as FetchArgs)?.body;
    if (body instanceof FormData) {
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

  if (!requestUrl || !requestUrl.startsWith("/")) {
    throw new Error(
      `[RTK Query Route Error]: Route "${requestUrl}" wajib diawali dengan slash '/'.`
    );
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const method = typeof args === "string" ? "GET" : args.method || "GET";
    console.warn(
      `⚠ [RTK Query ${result.error.status}]: ${method} ${requestUrl}`,
      result.error
    );
  }

  // Handle 401 di client
  if (
    result.error?.status === 401 &&
    typeof window !== "undefined" &&
    !isRedirecting
  ) {
    const currentPath = window.location.pathname;
    const isPublicPath = currentPath === "/" || currentPath.startsWith("/auth");

    if (!isPublicPath) {
      isRedirecting = true;
      window.location.replace(
        `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`
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
  refetchOnMountOrArgChange: false,
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