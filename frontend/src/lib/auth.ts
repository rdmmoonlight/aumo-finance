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
      console.error(
        "[AUTH] Gagal mengambil profil user:",
        err.response?.data || err.message,
      );
    } else {
      console.error("[AUTH] Unknown error saat mengambil profil user:", err);
    }
    return null;
  }
}

/**
 * Melakukan logout session di server (/api/v1/auth/logout)
 */
export async function logout(): Promise<boolean> {
  try {
    const res = await apiClient.post("/api/v1/auth/logout");
    return res.data?.success ?? true;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("[AUTH] Gagal logout:", err.response?.data || err.message);
    } else {
      console.error("[AUTH] Unknown error saat logout:", err);
    }
    return false;
  }
}
  
