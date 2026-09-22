import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { aumoConfig } from "../../aumo.config";

/**
 * Normalisasi URL agar wajib HTTPS untuk koneksi luar.
 * Mencegah server Next.js / browser melakukan request via HTTP biasa.
 */
function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

const BASE_URL = enforceHttps(aumoConfig.backendTarget);

// Base query utama dengan konfigurasi credentials & SSR cookie forwarding
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // WAJIB: Memaksa browser melampirkan Cookie SameSite=None (.NET Identity Session)
  credentials: "include",

  prepareHeaders: async (headers) => {
    // Meneruskan Cookie dari Browser saat Next.js melakukan SSR (Server-Side)
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        if (cookieHeader) {
          headers.set("Cookie", cookieHeader);
        }
      } catch {
        // Abaikan jika dieksekusi di luar konteks HTTP Request Next.js (misal: build time)
      }
    }
    return headers;
  },
});

/**
 * Custom BaseQuery dengan logika Response Interceptor:
 * Menangani 401 Unauthorized secara global di sisi Client-Side.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Jika terjadi 401 Unauthorized & dieksekusi di browser
  if (
    result.error &&
    result.error.status === 401 &&
    typeof window !== "undefined"
  ) {
    const currentPath = window.location.pathname;

    // Mencegah infinite loop redirect jika sudah di rute /auth atau /
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

  // Durasi penyimpanan cache (5 menit)
  keepUnusedDataFor: 300,

  // Daftar Tag Types untuk pembersihan/invalidation cache otomatis
  tagTypes: ["Auth", "User", "Transaction"],

  endpoints: () => ({}),
});
