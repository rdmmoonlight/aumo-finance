import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { aumoConfig } from "../../aumo.config";

function enforceHttps(url: string): string {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

// FIX 1: BASE_URL harus tetap mengarah ke backendTarget baik di Server maupun Client
const BASE_URL = enforceHttps(aumoConfig.backendTarget);

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // WAJIB: Agar Cookie Session (.NET Identity) dikirim otomatis pada request Client-Side
    credentials: "include",

    prepareHeaders: async (headers) => {
      // FIX 2: Penanganan SSR Cookie untuk Next.js App Router
      if (typeof window === "undefined") {
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const cookieHeader = cookieStore.toString();

          if (cookieHeader) {
            headers.set("cookie", cookieHeader);
          }
        } catch (error) {
          // Tetap aman jika dipanggil di luar konteks Request Next.js (misal: build time)
        }
      }
      return headers;
    },
  }),

  // Durasi default simpan tandon (misal: 300 detik / 5 menit)
  keepUnusedDataFor: 300,

  // Tag Invalidation untuk menguras tandon secara otomatis
  tagTypes: ["Auth", "User", "Transaction"],

  endpoints: () => ({}),
});
