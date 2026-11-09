import {
    getApiV1AuthMe,
    postApiV1AuthGoogleLogin,
    postApiV1AuthLogin,
    postApiV1AuthLogout,
} from "@/lib/generated";
import type {
    GoogleLoginRequest,
    LoginRequest,
} from "@/lib/generated/types.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

export type { GoogleLoginRequest, LoginRequest };

// --- Tipe respons (generated masih `unknown`, bentuk mengikuti backend) ---
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
    customClaims: Record<string, unknown>[];
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

// --- Query keys ---
export const authKeys = {
    all: ["auth"] as const,
    profile: ["auth", "profile"] as const,
};

// --- Fungsi API murni ---
export async function loginApi(body: LoginRequest) {
    const { data } = await postApiV1AuthLogin({ body, throwOnError: true });
    return data as AuthResponse;
}

export async function googleLoginApi(body: GoogleLoginRequest) {
    const { data } = await postApiV1AuthGoogleLogin({
        body,
        throwOnError: true,
    });
    return data as AuthResponse;
}

export async function getProfileApi(signal?: AbortSignal) {
    const { data } = await getApiV1AuthMe({ signal, throwOnError: true });
    return data as ProfileResponse;
}

export async function logoutApi() {
    const { data } = await postApiV1AuthLogout({ throwOnError: true });
    return data as CommonActionResponse;
}

// --- Composables ---
export function useLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

export function useGoogleLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: googleLoginApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

export function useGetProfileQuery() {
    return useQuery({
        queryKey: authKeys.profile,
        queryFn: ({ signal }) => getProfileApi(signal),
    });
}

export function useLogoutMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            // Logout: seluruh cache milik user sebelumnya dibuang
            queryClient.clear();
        },
    });
}
