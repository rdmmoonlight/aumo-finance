import apiClient from "@/lib/apiClient";

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<UserProfile>("/api/v1/auth/me");
    return res.data;
  } catch (error) {
    return null;
  }
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}