import { apiClient } from "@/lib/apiClient";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

export type NotificationItem = {
    id: string;
    title?: string;
    message?: string;
    isRead?: boolean;
    createdAt?: string;
    [key: string]: unknown;
};

export type GetNotificationsArg = {
    limit?: number | string;
};

export type MarkNotificationReadArg = {
    id: string;
};

export type CommonActionResponse = {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
};

export const notificationsKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationsKeys.all, "list"] as const,
    list: (filters?: GetNotificationsArg) =>
        [...notificationsKeys.lists(), filters ?? {}] as const,
};

// GET /notifications
export function useGetNotifications(arg?: GetNotificationsArg) {
    return useQuery({
        queryKey: notificationsKeys.list(arg),
        queryFn: async (): Promise<NotificationItem[]> => {
            const res = await apiClient.get("/notifications", {
                params: arg?.limit ? { limit: arg.limit } : undefined,
            });
            return res.data as NotificationItem[];
        },
    });
}

// PUT /notifications/{id}/read
export function useMarkNotificationAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: MarkNotificationReadArg): Promise<CommonActionResponse> => {
            const res = await apiClient.put(`/notifications/${id}/read`);
            return res.data as CommonActionResponse;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationsKeys.all });
        },
    });
}

// PUT /notifications/read-all
export function useMarkAllNotificationsAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<CommonActionResponse> => {
            const res = await apiClient.put("/notifications/read-all");
            return res.data as CommonActionResponse;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationsKeys.all });
        },
    });
}
