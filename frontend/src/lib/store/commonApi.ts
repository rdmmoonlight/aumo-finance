// src/lib/commonApi.ts
import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response ---
export type HealthCheckResponse = {
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
};

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

// --- Inject Endpoints Manual ---
export const commonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /
    getRoot: builder.query<unknown, void>({
      query: () => "/",
      providesTags: ["AumoBackend"],
    }),

    // HEAD /
    checkRootHead: builder.mutation<unknown, void>({
      query: () => ({
        url: "/",
        method: "HEAD",
      }),
      invalidatesTags: ["AumoBackend"],
    }),


    // GET /api/v1/health
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => "/api/v1/health",
      providesTags: ["Health"],
    }),

    // GET /api/v1/notifications
    getNotifications: builder.query<
      NotificationItem[],
      GetNotificationsArg | void
    >({
      query: (arg) => ({
        url: "/api/v1/notifications",
        params: arg?.limit ? { limit: arg.limit } : undefined,
      }),
      providesTags: ["Notifications"],
    }),

    // PUT /api/v1/notifications/{id}/read
    markNotificationAsRead: builder.mutation<
      CommonActionResponse,
      MarkNotificationReadArg
    >({
      query: ({ id }) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // PUT /api/v1/notifications/read-all
    markAllNotificationsAsRead: builder.mutation<CommonActionResponse, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});
