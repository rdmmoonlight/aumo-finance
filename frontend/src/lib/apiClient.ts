import axios from "axios";

// PENTING: Di browser, jangan panggil backend langsung (cross-domain).
// Gunakan path relatif ("") agar request tetap same-origin dan diteruskan
// oleh Next.js rewrite proxy (lihat next.config.mjs / aumo.config.ts).
// Alasan: jika browser memanggil domain backend secara langsung, cookie
// sesi (AumoFinance.Session) akan ter-scope ke DOMAIN BACKEND, bukan
// domain frontend — akibatnya middleware proxy.ts di frontend tidak
// pernah menemukan cookie tsb dan user terus dilempar balik ke /auth,
// walau email & password sudah benar dan login di backend sukses.
//
// Saat SSR (di server Next.js), rewrite tidak berlaku untuk fetch
// internal, jadi kita tetap panggil backend langsung di sana.
const BASE_URL =
  typeof window === "undefined"
    ? process.env.WEB_API_URL ||
      process.env.NEXT_PUBLIC_WEB_API_URL ||
      "http://localhost:5000"
    : "";

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
