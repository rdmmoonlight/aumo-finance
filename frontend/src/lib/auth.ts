import apiClient from "@/lib/apiClient";
import { UserProfile } from "@/components/side-bar";

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<UserProfile>("/api/v1/auth/me");
    return res.data;
  } catch (error) {
    return null;
  }
}
