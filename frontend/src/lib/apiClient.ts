import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { aumoConfig } from "../../aumo.config";

function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

const rawBaseUrl = typeof window === "undefined" ? aumoConfig.backendTarget : "";
const BASE_URL = enforceHttps(rawBaseUrl);

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // WAJIB: Agar Cookie Session 'AumoFinance.Session' (.NET Identity) dikirim otomatis
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
          // Abaikan jika dieksekusi di luar konteks HTTP Request Next.js
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Auth", "User", "Transaction"], // Sesuaikan Tag Invalidation jika ada
  endpoints: () => ({}),
});