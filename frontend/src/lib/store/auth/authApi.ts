import { baseApi } from "@/lib/apiClient";

// --- Types Request & Response ---
export interface LoginRequest {
  email: string;
  password?: string;
  rememberMe?: boolean;
  isMobileClient?: boolean;
  userAgent?: string;
  operatingSystem?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  isMobileClient?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  fullName?: string;
  avatarUrl?: string;
  token?: string;
  lockoutEnd?: string;
  errors?: string[];
}

export interface UserProfileData {
  id: string;
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  roles: string[];
  customClaims: Record<string, any>[];
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfileData;
  message?: string;
}

export interface CommonActionResponse {
  success: boolean;
  message: string;
}

// --- Inject Endpoints ke baseApi ---
export const authApi = baseApi.injectEndpoints({
  // Mencegah error 'overrideExisting' saat Next.js Turbopack HMR / Fast Refresh
  overrideExisting: !import.meta.env.PROD,
  endpoints: (builder) => ({
    // 1. POST /api/v1/auth/login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // 2. POST /api/v1/auth/google-login
    googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/google-login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // 3. GET /api/v1/auth/me
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["Auth"],
    }),

    // 4. POST /api/v1/auth/logout (Digabung & disederhanakan)
    logout: builder.mutation<CommonActionResponse, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

// Export hooks otomatis dari RTK Query
export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;
