import axios from "axios";

// PENTING: Di browser, gunakan path relatif ("") agar request ditangani Next.js Rewrites.
// Saat SSR (di server Node.js Next.js), panggil URL backend ASP.NET Core secara langsung.
const BASE_URL =
  typeof window === "undefined"
    ? process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "http://localhost:5000" // FIX: Default dipatenkan ke backend (.NET), bukan frontend (3000)
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
      // Abaikan jika dieksekusi di luar konteks HTTP Request Next.js Server
    }
  }
  return config;
});

// Response Interceptor: Menangani sesi habis / 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Memastikan error berasal dari respon HTTP backend dengan status 401
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const currentPath = window.location.pathname;

      // Samakan dengan rute login/auth frontend Anda (/auth)
      if (!currentPath.startsWith("/auth")) {
        window.location.href = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
          
