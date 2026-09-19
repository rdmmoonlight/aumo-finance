import axios from "axios";

// PENTING: Di browser, gunakan path relatif ("") agar request melewati Next.js Rewrites (Same-Origin).
// Saat SSR (Node.js Next.js Server), panggil URL backend ASP.NET Core secara langsung.
const BASE_URL =
  typeof window === "undefined"
    ? process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "https://aumonext-api.onrender.com" // Default dimiringkan ke HTTPS Production Backend
    : "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // WAJIB: Agar Cookie Session Identity terkirim secara otomatis
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Meneruskan Cookie dari Browser saat Next.js melakukan SSR
apiClient.interceptors.request.use(async (config) => {
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

      // Mencegah infinite loop redirect jika sudah berada di rute /auth
      if (!currentPath.startsWith("/auth")) {
        const redirectUrl = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
