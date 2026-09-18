import apiClient from "@/lib/apiClient";
import { UserProfile } from "@/components/layout/Sidebar";

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<UserProfile>("/api/v1/auth/me");
    return res.data;
  } catch (error) {
    // Jika 401 atau error di server, return null tanpa merusak render layout
    return null;
  }
}
