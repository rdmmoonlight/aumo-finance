// src/lib/commonApi.ts
import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response (Sesuai Hono OpenAPI Schema) ---
export type RootResponse = {
  status: string;
  message: string;
};

export type DatabaseHealthSuccessResponse = {
  status: "pass";
  timestamp: string;
  database: {
    status: "up";
    latency: string;
    name: string;
    serverTime: unknown | null;
  };
};

export type DatabaseHealthErrorResponse = {
  status: "fail";
  timestamp: string;
  database: {
    status: "down";
    error: string;
  };
};

export type HealthCheckResponse =
  DatabaseHealthSuccessResponse | DatabaseHealthErrorResponse;

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
    // GET / (Server Status)
    getRoot: builder.query<RootResponse, void>({
      query: () => "/",
      providesTags: ["AumoBackend"],
    }),

    // HEAD / (Ping API Server)
    // Diubah ke builder.query karena HEAD hanya membaca status tanpa mengubah/mengubah data (idempotent)
    checkRootHead: builder.query<void, void>({
      query: () => ({
        url: "/",
        method: "HEAD",
      }),
      providesTags: ["AumoBackend"],
    }),

    // GET /health (Database Health Check)
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => "/health",
      providesTags: ["Health"],
    }),

    // GET /notifications
    getNotifications: builder.query<
      NotificationItem[],
      GetNotificationsArg | void
    >({
      query: (arg) => ({
        url: "/notifications",
        params: arg?.limit ? { limit: arg.limit } : undefined,
      }),
      providesTags: ["Notifications"],
    }),

    // PUT /notifications/{id}/read
    markNotificationAsRead: builder.mutation<
      CommonActionResponse,
      MarkNotificationReadArg
    >({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // PUT /notifications/read-all
    markAllNotificationsAsRead: builder.mutation<CommonActionResponse, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetRootQuery,
  useCheckRootHeadQuery,
  useGetHealthQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = commonApi;
