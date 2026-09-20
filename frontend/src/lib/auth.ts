import axios from "axios";
import apiClient from "@/lib/apiClient";

export interface UserProfile {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  avatarUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Mengambil profil user yang sedang login via Cookie Session (/api/v1/auth/me)
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get("/api/v1/auth/me");

    if (res.data?.success) {
      return {
        userId: res.data.userId,
        email: res.data.email,
        userName: res.data.userName,
        fullName: res.data.fullName,
        roles: res.data.roles || [],
      };
    }
    return null;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // Abaikan log error jika 401 karena sudah ditangani oleh Interceptor apiClient
      if (err.response?.status !== 401) {
        console.error(
          "[AUTH] Gagal mengambil profil user:",
          err.response?.data || err.message,
        );
      }
    } else {
      console.error("[AUTH] Unknown error saat mengambil profil user:", err);
    }
    return null;
  }
}

/**
 * Melakukan logout session di server
 * Mencoba ke /api/v1/auth/logout terlebih dahulu (Controller),
 * lalu fallback ke /auth/logout (Minimal API Program.cs)
 */
export async function logout(): Promise<boolean> {
  try {
    let res;
    try {
      // Prioritas 1: Endpoint controller /api/v1/auth/logout jika ada
      res = await apiClient.post("/api/v1/auth/logout");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Fallback: Minimal API endpoint di Program.cs
        res = await apiClient.post("/auth/logout");
      } else {
        throw err;
      }
    }

    return res?.data?.success ?? true;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("[AUTH] Gagal logout:", err.response?.data || err.message);
    } else {
      console.error("[AUTH] Unknown error saat logout:", err);
    }
    return false;
  }
}
