import apiClient from "@/lib/apiClient";

export interface UserProfile {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  avatarUrl?: string;
}

// Tambahkan alias ini agar kompatibel dengan import 'getUserProfile'
export async function getUserProfile(): Promise<UserProfile | null> {
  return getAuthUser();
}

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    return null;
  }
}

// Tambahkan fungsi logout (karena menggunakan cookie, browser akan menangani penghapusan cookie via response backend)
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
