import { baseApi as api } from "../../apiClient";
export const addTagTypes = ["Auth"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postApiV1AuthLogin: build.mutation<
        PostApiV1AuthLoginApiResponse,
        PostApiV1AuthLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      postApiV1AuthGoogleLogin: build.mutation<
        PostApiV1AuthGoogleLoginApiResponse,
        PostApiV1AuthGoogleLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/google-login`,
          method: "POST",
          body: queryArg.googleLoginRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      getApiV1AuthGoogleLogin: build.query<
        GetApiV1AuthGoogleLoginApiResponse,
        GetApiV1AuthGoogleLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/google-login`,
          params: {
            redirectTo: queryArg.redirectTo,
          },
        }),
        providesTags: ["Auth"],
      }),
      getApiV1AuthGoogleCallback: build.query<
        GetApiV1AuthGoogleCallbackApiResponse,
        GetApiV1AuthGoogleCallbackApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/google-callback`,
          params: {
            redirectTo: queryArg.redirectTo,
            remoteError: queryArg.remoteError,
          },
        }),
        providesTags: ["Auth"],
      }),
      getApiV1AuthMe: build.query<
        GetApiV1AuthMeApiResponse,
        GetApiV1AuthMeApiArg
      >({
        query: () => ({ url: `/api/v1/auth/me` }),
        providesTags: ["Auth"],
      }),
      postApiV1AuthLogout: build.mutation<
        PostApiV1AuthLogoutApiResponse,
        PostApiV1AuthLogoutApiArg
      >({
        query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
        invalidatesTags: ["Auth"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type PostApiV1AuthLoginApiResponse = unknown;
export type PostApiV1AuthLoginApiArg = {
  loginRequest: LoginRequest;
};
export type PostApiV1AuthGoogleLoginApiResponse = unknown;
export type PostApiV1AuthGoogleLoginApiArg = {
  googleLoginRequest: GoogleLoginRequest;
};
export type GetApiV1AuthGoogleLoginApiResponse = unknown;
export type GetApiV1AuthGoogleLoginApiArg = {
  redirectTo?: string;
};
export type GetApiV1AuthGoogleCallbackApiResponse = unknown;
export type GetApiV1AuthGoogleCallbackApiArg = {
  redirectTo?: string;
  remoteError?: string;
};
export type GetApiV1AuthMeApiResponse = unknown;
export type GetApiV1AuthMeApiArg = void;
export type PostApiV1AuthLogoutApiResponse = unknown;
export type PostApiV1AuthLogoutApiArg = void;
export type LoginRequest = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
  isMobileClient?: boolean;
  userAgent?: null | string;
  operatingSystem?: null | string;
};
export type GoogleLoginRequest = {
  idToken?: string;
  isMobileClient?: boolean;
};
export const {
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  useGetApiV1AuthGoogleLoginQuery,
  useGetApiV1AuthGoogleCallbackQuery,
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
} = injectedRtkApi;
