"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { baseApi } from "@/lib/apiClient";
import {
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  usePostApiV1AuthLogoutMutation,
  type LoginRequest,
  type GoogleLoginRequest,
} from "@/lib/generatedApi";

/**
 * Re-export tipe payload & response dari generatedApi
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
 * Otomatis di-skip saat SSR (Server-Side Rendering) untuk mencegah 401 spam di log backend.
 */
export function useUserProfile(options?: { skip?: boolean }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wajib skip jika belum mounted di client atau dimintai skip dari props
  const shouldSkip = !isMounted || (options?.skip ?? false);

  const { data, isLoading, isError, error, refetch } = useGetApiV1AuthMeQuery(
    undefined,
    { skip: shouldSkip }
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
    // Jika belum mounted (di server), anggap masih loading agar UI tidak blinking
    isLoading: !isMounted || isLoading,
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

  const login = async (payload: LoginPayload, redirectTo = "/dashboard") => {
    try {
      const response = await loginMutation({
        loginRequest: payload,
      }).unwrap();

      // Gunakan window.location.href agar cookie Identity ter-apply sempurna di browser
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.message || "Gagal melakukan login. Periksa email dan kata sandi Anda.",
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

  const googleLogin = async (payload: GoogleLoginPayload, redirectTo = "/dashboard") => {
    try {
      const response = await googleLoginMutation({
        googleLoginRequest: payload,
      }).unwrap();

      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.message || "Gagal login menggunakan akun Google.",
        error: err,
      };
    }
  };

  return [googleLogin, result] as const;
}

/**
 * Hook untuk Logout
 * Otomatis menguras seluruh cache Redux RTK Query milik akun sebelumnya.
 */
export function useAuthLogout() {
  const dispatch = useDispatch();
  const [logoutMutation, result] = usePostApiV1AuthLogoutMutation();

  const logout = async (redirectTo = "/auth") => {
    try {
      const response = await logoutMutation().unwrap();

      // Bersihkan seluruh cache Redux RTK Query
      dispatch(baseApi.util.resetApiState());

      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      console.error("[AUTH] Gagal logout:", err);

      // Tetap bersihkan state dan redirect jika backend merespon 401
      dispatch(baseApi.util.resetApiState());
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }

      return {
        success: false,
        message: err?.data?.message || "Gagal melakukan logout.",
        error: err,
      };
    }
  };

  return [logout, result] as const;
}
