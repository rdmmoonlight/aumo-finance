import apiClient from "@/lib/apiClient";

export interface UserProfile {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  avatarUrl?: string;
}

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    return null;
  }
}