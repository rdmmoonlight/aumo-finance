import { baseApi } from "@/lib/apiClient";

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

// --- Slice Definition ---
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PUT /api/v1/settings/profile
    updateProfile: builder.mutation<unknown, UpdateProfileRequest>({
      query: (body) => ({
        url: "/api/v1/settings/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // POST /api/v1/settings/avatar
    uploadAvatar: builder.mutation<unknown, FormData>({
      query: (formData) => ({
        url: "/api/v1/settings/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Settings"],
    }),

    // POST /api/v1/settings/change-password
    changePassword: builder.mutation<unknown, ChangePasswordRequest>({
      query: (body) => ({
        url: "/api/v1/settings/change-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // DELETE /api/v1/settings/delete-account
    deleteAccount: builder.mutation<unknown, void>({
      query: () => ({
        url: "/api/v1/settings/delete-account",
        method: "DELETE",
      }),
      invalidatesTags: ["Settings"],
    }),

    // GET /api/v1/settings/guardian/dashboard
    getGuardianDashboard: builder.query<unknown, void>({
      query: () => "/api/v1/settings/guardian/dashboard",
      providesTags: ["Settings"],
    }),

    // POST /api/v1/settings/guardian/revoke-session/{sessionId}
    revokeSessionById: builder.mutation<unknown, RevokeSessionArg>({
      query: ({ sessionId }) => ({
        url: `/api/v1/settings/guardian/revoke-session/${sessionId}`,
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),

    // POST /api/v1/settings/guardian/revoke-all-sessions
    revokeAllSessions: builder.mutation<unknown, void>({
      query: () => ({
        url: "/api/v1/settings/guardian/revoke-all-sessions",
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});
