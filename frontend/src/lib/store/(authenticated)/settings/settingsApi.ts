import { baseApi as api } from "../../../apiClient";
export const addTagTypes = ["Settings"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      putApiV1SettingsProfile: build.mutation<
        PutApiV1SettingsProfileApiResponse,
        PutApiV1SettingsProfileApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/profile`,
          method: "PUT",
          body: queryArg.updateProfileRequest,
        }),
        invalidatesTags: ["Settings"],
      }),
      postApiV1SettingsAvatar: build.mutation<
        PostApiV1SettingsAvatarApiResponse,
        PostApiV1SettingsAvatarApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/avatar`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Settings"],
      }),
      postApiV1SettingsChangePassword: build.mutation<
        PostApiV1SettingsChangePasswordApiResponse,
        PostApiV1SettingsChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/change-password`,
          method: "POST",
          body: queryArg.changePasswordRequest,
        }),
        invalidatesTags: ["Settings"],
      }),
      deleteApiV1SettingsDeleteAccount: build.mutation<
        DeleteApiV1SettingsDeleteAccountApiResponse,
        DeleteApiV1SettingsDeleteAccountApiArg
      >({
        query: () => ({
          url: `/api/v1/settings/delete-account`,
          method: "DELETE",
        }),
        invalidatesTags: ["Settings"],
      }),
      getApiV1SettingsGuardianDashboard: build.query<
        GetApiV1SettingsGuardianDashboardApiResponse,
        GetApiV1SettingsGuardianDashboardApiArg
      >({
        query: () => ({ url: `/api/v1/settings/guardian/dashboard` }),
        providesTags: ["Settings"],
      }),
      postApiV1SettingsGuardianRevokeSessionBySessionId: build.mutation<
        PostApiV1SettingsGuardianRevokeSessionBySessionIdApiResponse,
        PostApiV1SettingsGuardianRevokeSessionBySessionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/guardian/revoke-session/${queryArg.sessionId}`,
          method: "POST",
        }),
        invalidatesTags: ["Settings"],
      }),
      postApiV1SettingsGuardianRevokeAllSessions: build.mutation<
        PostApiV1SettingsGuardianRevokeAllSessionsApiResponse,
        PostApiV1SettingsGuardianRevokeAllSessionsApiArg
      >({
        query: () => ({
          url: `/api/v1/settings/guardian/revoke-all-sessions`,
          method: "POST",
        }),
        invalidatesTags: ["Settings"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type PutApiV1SettingsProfileApiResponse = unknown;
export type PutApiV1SettingsProfileApiArg = {
  updateProfileRequest: UpdateProfileRequest;
};
export type PostApiV1SettingsAvatarApiResponse = unknown;
export type PostApiV1SettingsAvatarApiArg = {
  body: {
    ContentType?: string;
    ContentDisposition?: string;
    Headers?: {
      [key: string]: string[];
    };
    Length?: number | string;
    Name?: string;
    FileName?: string;
  } & {
    ContentType?: string;
    ContentDisposition?: string;
    Headers?: {
      [key: string]: string[];
    };
    Length?: number | string;
    Name?: string;
    FileName?: string;
  };
};
export type PostApiV1SettingsChangePasswordApiResponse = unknown;
export type PostApiV1SettingsChangePasswordApiArg = {
  changePasswordRequest: ChangePasswordRequest;
};
export type DeleteApiV1SettingsDeleteAccountApiResponse = unknown;
export type DeleteApiV1SettingsDeleteAccountApiArg = void;
export type GetApiV1SettingsGuardianDashboardApiResponse = unknown;
export type GetApiV1SettingsGuardianDashboardApiArg = void;
export type PostApiV1SettingsGuardianRevokeSessionBySessionIdApiResponse =
  unknown;
export type PostApiV1SettingsGuardianRevokeSessionBySessionIdApiArg = {
  sessionId: string;
};
export type PostApiV1SettingsGuardianRevokeAllSessionsApiResponse = unknown;
export type PostApiV1SettingsGuardianRevokeAllSessionsApiArg = void;
export type UpdateProfileRequest = {
  fullName?: null | string;
  userName?: null | string;
  phoneNumber?: null | string;
  bio?: null | string;
  avatarUrl?: null | string;
};
export type ChangePasswordRequest = {
  currentPassword?: string;
  newPassword?: string;
};
export const {
  usePutApiV1SettingsProfileMutation,
  usePostApiV1SettingsAvatarMutation,
  usePostApiV1SettingsChangePasswordMutation,
  useDeleteApiV1SettingsDeleteAccountMutation,
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
} = injectedRtkApi;
