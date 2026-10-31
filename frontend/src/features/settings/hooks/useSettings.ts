import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

// --- DTO Types ---
export interface UpdateProfileRequest {
    fullName?: string | null;
    userName?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
}

export interface RevokeSessionArg {
    sessionId: string;
}

// --- Query Keys ---
export const settingsKeys = {
    all: ["settings"] as const,
    dashboard: () => [...settingsKeys.all, "dashboard"] as const,
};

// --- Mutations ---

export function useUpdateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: UpdateProfileRequest) => {
            const res = await apiClient.put("/settings/profile", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useUploadAvatar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await apiClient.post("/settings/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useChangePassword() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: ChangePasswordRequest) => {
            const res = await apiClient.post("/settings/change-password", body);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useDeleteAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.delete("/settings/delete-account");
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useRevokeSessionById() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId }: RevokeSessionArg) => {
            const res = await apiClient.post(`/settings/guardian/revoke-session/${sessionId}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}

export function useRevokeAllSessions() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.post("/settings/guardian/revoke-all-sessions");
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.all });
        },
    });
}
