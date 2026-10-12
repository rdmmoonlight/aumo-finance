// src/api/common.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    CommonActionResponse,
    GetNotificationsArg,
    HealthCheckResponse,
    MarkNotificationReadArg,
    NotificationItem,
    RootResponse
} from "@/types/common";

/**
 * GET / (Server Status)
 */
export function getRoot(): Promise<RootResponse> {
    return coreStore.fetchWithCache(
        "/",
        () => apiClient<RootResponse>("/"),
        { ttl: 60000, tags: ["AumoBackend"] }
    );
}

/**
 * HEAD / (Ping API Server)
 */
export function checkRootHead(): Promise<void> {
    return coreStore.fetchWithCache(
        "HEAD_/",
        () => apiClient("/", { method: "HEAD" }),
        { ttl: 30000, tags: ["AumoBackend"] }
    );
}

/**
 * GET /health (Database Health Check)
 */
export function getHealth(): Promise<HealthCheckResponse> {
    return coreStore.fetchWithCache(
        "/health",
        () => apiClient<HealthCheckResponse>("/health"),
        { ttl: 15000, tags: ["Health"] }
    );
}

/**
 * GET /notifications
 */
export function getNotifications(arg?: GetNotificationsArg): Promise<NotificationItem[]> {
    const query = arg?.limit ? `?limit=${encodeURIComponent(arg.limit)}` : "";
    const cacheKey = `/notifications${query}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient<NotificationItem[]>(cacheKey),
        { ttl: 30000, tags: ["Notifications"] }
    );
}

/**
 * PUT /notifications/{id}/read
 */
export async function markNotificationAsRead(
    arg: MarkNotificationReadArg
): Promise<CommonActionResponse> {
    const result = await apiClient<CommonActionResponse>(`/notifications/${arg.id}/read`, {
        method: "PUT",
    });
    coreStore.invalidate(["Notifications"]);
    return result;
}

/**
 * PUT /notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<CommonActionResponse> {
    const result = await apiClient<CommonActionResponse>("/notifications/read-all", {
        method: "PUT",
    });
    coreStore.invalidate(["Notifications"]);
    return result;
}