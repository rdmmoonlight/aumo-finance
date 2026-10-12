// src/api/settings.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    ChangePasswordRequest,
    RevokeSessionArg,
    UpdateProfileRequest
} from "@/types/settings";

/**
 * PUT /settings/profile
 */
export async function updateProfile(body: UpdateProfileRequest): Promise<unknown> {
    const result = await apiClient("/settings/profile", {
        method: "PUT",
        body,
    });
    coreStore.invalidate(["Settings"]);
    return result;
}

/**
 * POST /settings/avatar
 * FormData ditangani otomatis oleh apiClient tanpa set header Content-Type manual
 */
export async function uploadAvatar(formData: FormData): Promise<unknown> {
    const result = await apiClient("/settings/avatar", {
        method: "POST",
        body: formData,
    });
    coreStore.invalidate(["Settings"]);
    return result;
}

/**
 * POST /settings/change-password
 */
export async function changePassword(body: ChangePasswordRequest): Promise<unknown> {
    const result = await apiClient("/settings/change-password", {
        method: "POST",
        body,
    });
    coreStore.invalidate(["Settings"]);
    return result;
}

/**
 * DELETE /settings/delete-account
 */
export async function deleteAccount(): Promise<unknown> {
    const result = await apiClient("/settings/delete-account", {
        method: "DELETE",
    });
    coreStore.invalidate(["Settings"]);
    return result;
}

/**
 * GET /settings/guardian/dashboard
 */
export function getGuardianDashboard(): Promise<unknown> {
    return coreStore.fetchWithCache(
        "/settings/guardian/dashboard",
        () => apiClient("/settings/guardian/dashboard"),
        { ttl: 60000, tags: ["Settings"] }
    );
}

/**
 * POST /settings/guardian/revoke-session/{sessionId}
 */
export async function revokeSessionById({ sessionId }: RevokeSessionArg): Promise<unknown> {
    const result = await apiClient(`/settings/guardian/revoke-session/${sessionId}`, {
        method: "POST",
    });
    coreStore.invalidate(["Settings"]);
    return result;
}

/**
 * POST /settings/guardian/revoke-all-sessions
 */
export async function revokeAllSessions(): Promise<unknown> {
    const result = await apiClient("/settings/guardian/revoke-all-sessions", {
        method: "POST",
    });
    coreStore.invalidate(["Settings"]);
    return result;
}