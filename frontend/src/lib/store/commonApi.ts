import { baseApi as api } from "../apiClient";
export const addTagTypes = ["AumoBackend", "Health", "Notifications"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      $get: build.query<$getApiResponse, $getApiArg>({
        query: () => ({ url: `/` }),
        providesTags: ["AumoBackend"],
      }),
      head: build.mutation<HeadApiResponse, HeadApiArg>({
        query: () => ({ url: `/`, method: "HEAD" }),
        invalidatesTags: ["AumoBackend"],
      }),
      postAuthLogout: build.mutation<
        PostAuthLogoutApiResponse,
        PostAuthLogoutApiArg
      >({
        query: () => ({ url: `/auth/logout`, method: "POST" }),
        invalidatesTags: ["AumoBackend"],
      }),
      getApiV1Health: build.query<
        GetApiV1HealthApiResponse,
        GetApiV1HealthApiArg
      >({
        query: () => ({ url: `/api/v1/health` }),
        providesTags: ["Health"],
      }),
      getApiV1Notifications: build.query<
        GetApiV1NotificationsApiResponse,
        GetApiV1NotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/notifications`,
          params: {
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Notifications"],
      }),
      putApiV1NotificationsByIdRead: build.mutation<
        PutApiV1NotificationsByIdReadApiResponse,
        PutApiV1NotificationsByIdReadApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/notifications/${queryArg.id}/read`,
          method: "PUT",
        }),
        invalidatesTags: ["Notifications"],
      }),
      putApiV1NotificationsReadAll: build.mutation<
        PutApiV1NotificationsReadAllApiResponse,
        PutApiV1NotificationsReadAllApiArg
      >({
        query: () => ({ url: `/api/v1/notifications/read-all`, method: "PUT" }),
        invalidatesTags: ["Notifications"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type $getApiResponse = unknown;
export type $getApiArg = void;
export type HeadApiResponse = unknown;
export type HeadApiArg = void;
export type PostAuthLogoutApiResponse = unknown;
export type PostAuthLogoutApiArg = void;
export type GetApiV1HealthApiResponse = unknown;
export type GetApiV1HealthApiArg = void;
export type GetApiV1NotificationsApiResponse = unknown;
export type GetApiV1NotificationsApiArg = {
  limit?: number | string;
};
export type PutApiV1NotificationsByIdReadApiResponse = unknown;
export type PutApiV1NotificationsByIdReadApiArg = {
  id: string;
};
export type PutApiV1NotificationsReadAllApiResponse = unknown;
export type PutApiV1NotificationsReadAllApiArg = void;
export const {
  use$getQuery,
  useHeadMutation,
  usePostAuthLogoutMutation,
  useGetApiV1HealthQuery,
  useGetApiV1NotificationsQuery,
  usePutApiV1NotificationsByIdReadMutation,
  usePutApiV1NotificationsReadAllMutation,
} = injectedRtkApi;
