import {
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  usePostApiV1AuthLogoutMutation,
  LoginRequest,
  GoogleLoginRequest,
} from "@/lib/generatedApi";

/**
 * Re-export tipe payload & response dari generatedApi agar tetap konsisten
 */
export type UserProfile = {
  userId?: string;
  email?: string;
  userName?: string;
  fullName?: string;
  roles?: string[];
  customClaims?: Array<Record<string, string>>;
};

export type LoginPayload = LoginRequest;
export type GoogleLoginPayload = GoogleLoginRequest;

/**
 * Hook untuk mengambil profil user aktif (`/api/v1/auth/me`)
 */
export function useUserProfile(options?: { skip?: boolean }) {
  const { data, isLoading, isError, error, refetch } = useGetApiV1AuthMeQuery(
    undefined,
    { skip: options?.skip }
  );

  const responseData = data as
    | {
        success?: boolean;
        userId?: string;
        email?: string;
        userName?: string;
        fullName?: string;
        roles?: string[];
        customClaims?: Array<Record<string, string>>;
      }
    | undefined;

  const profile: UserProfile | null = responseData?.success
    ? {
        userId: responseData.userId,
        email: responseData.email,
        userName: responseData.userName,
        fullName: responseData.fullName,
        roles: responseData.roles || [],
        customClaims: responseData.customClaims || [],
      }
    : null;

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook untuk Login Email & Password
 */
export function useAuthLogin() {
  const [loginMutation, result] = usePostApiV1AuthLoginMutation();

  const login = async (payload: LoginPayload) => {
    try {
      const response = await loginMutation({
        loginRequest: payload,
      }).unwrap();

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.message || "Gagal melakukan login.",
        error: err,
      };
    }
  };

  return [login, result] as const;
}

/**
 * Hook untuk Login Google OAuth
 */
export function useGoogleLogin() {
  const [googleLoginMutation, result] = usePostApiV1AuthGoogleLoginMutation();

  const googleLogin = async (payload: GoogleLoginPayload) => {
    try {
      const response = await googleLoginMutation({
        googleLoginRequest: payload,
      }).unwrap();

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.message || "Gagal login menggunakan Google.",
        error: err,
      };
    }
  };

  return [googleLogin, result] as const;
}

/**
 * Hook untuk Logout
 */
export function useAuthLogout() {
  const [logoutMutation, result] = usePostApiV1AuthLogoutMutation();

  const logout = async () => {
    try {
      const response = await logoutMutation().unwrap();
      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      console.error("[AUTH] Gagal logout:", err);
      return {
        success: false,
        message: err?.data?.message || "Gagal melakukan logout.",
        error: err,
      };
    }
  };

  return [logout, result] as const;
}