import axios from "axios";

// Mengambil URL Backend .NET dari Environment Variable
const BASE_URL = process.env.NEXT_PUBLIC_WEB_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // WAJIB: Agar Cookie Session Identity terkirim secara otomatis
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Meneruskan Cookie dari Request Browser saat Next.js SSR
apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      if (cookieHeader) {
        config.headers.Cookie = cookieHeader;
      }
    } catch {
      // Abaikan jika dieksekusi di luar konteks Request Server Next.js
    }
  }
  return config;
});

// Response Interceptor: Menangani sesi habis / 401 Unauthorized
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Mencegah redirect berulang jika pengguna sudah berada di halaman login
      if (currentPath !== "/login" && currentPath !== "/auth") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default apiClient;