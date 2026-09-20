import axios from "axios";
import { aumoConfig } from "../../aumo.config";

/**
 * Normalisasi URL agar Wajib HTTPS untuk koneksi luar.
 * Mencegah Server Next.js / Browser melakukan request via HTTP biasa.
 */
function enforceHttps(url: string): string {
  if (!url) return url;

  // Izinkan HTTP hanya jika pengujian lokal di localhost
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return url;
  }

  // Jika terdeteksi HTTP, paksa ubah menjadi HTTPS
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  return url;
}

// Menentukan BASE_URL dengan proteksi HTTPS
const rawBaseUrl = typeof window === "undefined" ? aumoConfig.backendTarget : "";
const BASE_URL = enforceHttps(rawBaseUrl);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // WAJIB: Agar Cookie Session Identity terkirim secara otomatis
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Meneruskan Cookie & Validasi Ketat HTTPS
apiClient.interceptors.request.use(async (config) => {
  // 1. Sanitize & Validasi baseURL / URL target
  if (config.baseURL) {
    config.baseURL = enforceHttps(config.baseURL);
  }

  if (config.url && config.url.startsWith("http://") && !config.url.includes("localhost")) {
    config.url = config.url.replace("http://", "https://");
  }

  // 2. BLOKIR KERAS jika masih ada request HTTP non-localhost yang lolos di sisi server
  const fullTarget = (config.baseURL || "") + (config.url || "");
  if (fullTarget.startsWith("http://") && !fullTarget.includes("localhost")) {
    throw new Error(`[SECURITY ERROR] Request HTTP dilarang: ${fullTarget}. Wajib menggunakan HTTPS.`);
  }

  // 3. Meneruskan Cookie dari Browser saat Next.js melakukan SSR (Server-Side)
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      if (cookieHeader) {
        config.headers.set("Cookie", cookieHeader);
      }
    } catch {
      // Abaikan jika dieksekusi di luar konteks HTTP Request Server Next.js
    }
  }

  return config;
});

// Response Interceptor: Menangani sesi habis / 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Memastikan error berasal dari respon HTTP backend dengan status 401 & hanya berjalan di browser
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const currentPath = window.location.pathname;

      // Mencegah infinite loop redirect jika sudah berada di rute / atau /auth
      if (!currentPath.startsWith("/auth") && currentPath !== "/") {
        const redirectUrl = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
  
