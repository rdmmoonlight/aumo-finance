import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper Cookie Client-side
function getCookie(name: string): string | undefined {
  if (typeof window === "undefined" || typeof document === "undefined")
    return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export function getBackendTarget(): string {
  // 1. Jika kode berjalan di Browser (Client-side)
  // PAKSA string kosong "" agar browser selalu menggunakan Relative Path
  // yang ditangani Nginx (misal: https://aumoweb.onrender.com/auth/me)
  if (typeof window !== "undefined") {
    return "";
  }

  // 2. Jika kode berjalan di Node.js Server (Next.js SSR inside container)
  let target =
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_URL ||
    process.env.WEB_API_URL ||
    "http://127.0.0.1:5000";

  return target.replace(/\/+$/, "");
}

export const API_BASE_URL = getBackendTarget();
export const getApiBaseUrl = () => getBackendTarget();

const rawBaseQuery = fetchBaseQuery({
  // Gunakan fungsi getter dinamis agar tidak terkunci variabel statis
  baseUrl: `${getBackendTarget()}/api/v1`,
  credentials: "include",
  prepareHeaders: async (headers, { arg }) => {
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
  const requestMethod = typeof args === "string" ? "GET" : args.method || "GET";

  const currentBaseUrl = getBackendTarget();
  const fullTargetUrl = `${currentBaseUrl}${requestUrl}`;

  if (!requestUrl || !requestUrl.startsWith("/")) {
    console.error(
      `❌ [RTK Query Route Error]: Route "${requestUrl}" tidak diawali slash '/'. Full Target URL: "${fullTargetUrl}"`,
    );
    throw new Error(
      `[RTK Query Route Error]: Route "${requestUrl}" wajib diawali dengan slash '/'. Mohon perbaiki penulisan endpoint.`,
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

  if (result.error) {
    console.warn(
      `⚠️ [RTK Query Fetch Error ${result.error.status}]: ${requestMethod} ${fullTargetUrl}`,
      result.error,
    );
  }

  // Penanganan Unauthenticated (401) di sisi client
  if (
    result.error &&
    result.error.status === 401 &&
    typeof window !== "undefined"
  ) {
    const currentPath = window.location.pathname;

    // Halaman publik (landing & about) menangani status belum login sendiri.
    const isPublicPath = currentPath === "/" || currentPath === "/about";

    // Cegah loop jika sedang berada di halaman login/auth
    if (!isPublicPath && !currentPath.startsWith("/auth") && !isRedirecting) {
      isRedirecting = true;
      // Tujuan memakai "/auth/login" (bukan "/auth?...") agar tidak terkena 301
      // lama dari nginx yang tersimpan permanen di cache browser (berujung :10000).
      window.location.replace(
        `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`,
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
  refetchOnMountOrArgChange: false, // Disabilitas otomatis refetch pada mount untuk cegah loop
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

// ============================================================================
// --- TANSTACK QUERY CLIENT (TAMBAHAN BARU / DAPAT BERJALAN BERIRINGAN) ---
// ============================================================================

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function customFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<{ data: T; status: number; headers: Headers }> {
  if (!endpoint.startsWith("/")) {
    console.error(
      `❌ [apiClient Route Error]: Route "${endpoint}" tidak diawali slash '/'.`,
    );
    throw new Error(
      `[apiClient Route Error]: Route "${endpoint}" wajib diawali dengan slash '/'.`,
    );
  }

  const baseUrl = `${getBackendTarget()}/api/v1`;
  const { params, headers: customHeaders, body, ...restOptions } = options;

  // Formatting Query Parameters
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = new Headers(customHeaders);

  // Set default JSON Content-Type jika bukan FormData
  if (!(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Jika FormData, biarkan browser menentukan Content-Type & boundary secara otomatis
  if (body instanceof FormData) {
    headers.delete("Content-Type");
    headers.delete("content-type");
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: "include",
    body: body instanceof FormData || typeof body === "string" ? body : JSON.stringify(body),
  };

  const response = await fetch(url, config);

  // Penanganan Error 401 (Unauthenticated) di Client
  if (response.status === 401 && typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isPublicPath = currentPath === "/" || currentPath === "/about";

    if (!isPublicPath && !currentPath.startsWith("/auth") && !isRedirecting) {
      isRedirecting = true;
      window.location.replace(
        `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`,
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || `HTTP Error ${response.status}: ${response.statusText}`,
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  // Handle Response Kosong (misal HTTP 204 No Content)
  let data: T;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = (await response.text()) as unknown as T;
  }

  return { data, status: response.status, headers: response.headers };
}

export const apiClient = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    customFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    customFetch<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    customFetch<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    customFetch<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    customFetch<T>(endpoint, { ...options, method: "DELETE" }),
};