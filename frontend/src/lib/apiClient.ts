import axios from "axios";

// Strict Base URL: Mengembalikan URL murni sesuai env
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Di Client: Gunakan env client atau fallback string kosong (relatif)
    return process.env.NEXT_PUBLIC_WEB_API_URL || "";
  }
  // Di Server (SSR): Gunakan env server atau fallback default
  return (
    process.env.WEB_API_URL ||
    process.env.NEXT_PUBLIC_WEB_API_URL ||
    "http://localhost:3000"
  );
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Murni oper Cookie saat SSR
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
      // Mengabaikan error jika dipanggil di luar konteks request Next.js
    }
  }

  return config;
});

// Response Interceptor: Menangani Unauthenticated Request (401)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  },
);

export default apiClient;
