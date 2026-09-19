import apiClient from "./apiClient";

export interface UserProfile {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  avatarUrl?: string;
}

export interface ApiResponse<T = any> {
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

    if (res.data && res.data.success) {
      return {
        userId: res.data.userId,
        email: res.data.email,
        userName: res.data.userName,
        fullName: res.data.fullName,
        roles: res.data.roles || [],
      };
    }
    return null;
  } catch (err: any) {
    // 401 Unauthorized/404 Not Found akan masuk ke sini
    console.error(
      "[AUTH] Gagal mengambil profil user:",
      err.response?.data || err.message,
    );
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
  } catch (err: any) {
    console.error("[AUTH] Gagal logout:", err.response?.data || err.message);
    return false;
  }
}
