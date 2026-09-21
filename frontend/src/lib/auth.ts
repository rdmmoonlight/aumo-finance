import axios from "axios";
import apiClient from "@/lib/apiClient";

export interface UserProfile {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  customClaims?: Record<string, string>[];
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  isMobileClient?: boolean;
  userAgent?: string;
  operatingSystem?: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  isMobileClient?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  userId?: string;
  fullName?: string;
  token?: string; // Hanya diisi jika Mobile / JWT Flow
}

/**
 * Mengambil profil user yang sedang login (/api/v1/auth/me)
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    // Sesuai dengan bentuk Anonymous Object pada AuthController.cs
    const res = await apiClient.get<{
      success: boolean;
      userId: string;
      email: string;
      userName: string;
      fullName: string;
      roles: string[];
      customClaims?: Record<string, string>[];
    }>("/api/v1/auth/me");

    if (res.data?.success) {
      return {
        userId: res.data.userId,
        email: res.data.email,
        userName: res.data.userName,
        fullName: res.data.fullName,
        roles: res.data.roles || [],
        customClaims: res.data.customClaims || [],
      };
    }
    return null;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
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
 * Login akun menggunakan Email & Password
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>(
      "/api/v1/auth/login",
      payload,
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        success: false,
        message: err.response?.data?.message || "Gagal melakukan login.",
      };
    }
    return { success: false, message: "Terjadi kesalahan tidak terduga." };
  }
}

/**
 * Login menggunakan Google OAuth (ID Token)
 */
export async function googleLogin(
  payload: GoogleLoginPayload,
): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>(
      "/api/v1/auth/google-login",
      payload,
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Gagal login menggunakan Google.",
      };
    }
    return { success: false, message: "Terjadi kesalahan tidak terduga." };
  }
}

/**
 * Melakukan logout session di server (/api/v1/auth/logout)
 */
export async function logout(): Promise<boolean> {
  try {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      "/api/v1/auth/logout",
    );
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
