import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

// --- Query Keys Constant ---
export const authKeys = {
    all: ["auth"] as const,
    profile: () => [...authKeys.all, "profile"] as const,
};

// --- TanStack Query Hooks ---

// 1. GET /auth/me (Get Profile Query)
export function useGetProfile() {
    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: async () => {
            const { data } = await apiClient.get<ProfileResponse>("/auth/me");
            return data;
        },
    });
}

// 2. POST /auth/login (Login Mutation)
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LoginRequest) => {
            const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

// 3. POST /auth/google-login (Google Login Mutation)
export function useGoogleLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: GoogleLoginRequest) => {
            const { data } = await apiClient.post<AuthResponse>("/auth/google-login", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

// 4. POST /auth/logout (Logout Mutation)
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post<CommonActionResponse>("/auth/logout");
            return data;
        },
        onSuccess: () => {
            // Invalidate cache dan reset query data user saat logout
            queryClient.invalidateQueries({ queryKey: authKeys.all });
            queryClient.resetQueries({ queryKey: authKeys.all });
        },
    });
}