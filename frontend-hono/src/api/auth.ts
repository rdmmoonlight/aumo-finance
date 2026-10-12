// src/api/auth.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    AuthResponse,
    CommonActionResponse,
    GoogleLoginRequest,
    LoginRequest,
    ProfileResponse,
    RegisterRequest
} from "@/types";

/**
 * 1. POST /auth/register
 */
export async function register(payload: RegisterRequest): Promise<AuthResponse> {
    const result = await apiClient("/auth/register", {
        method: "POST",
        body: payload,
    });
    coreStore.invalidate(["Auth"]);
    return result;
}

/**
 * 2. POST /auth/login
 */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
    const result = await apiClient("/auth/login", {
        method: "POST",
        body: payload,
    });
    coreStore.invalidate(["Auth"]);
    return result;
}

/**
 * 3. POST /auth/google-login
 */
export async function googleLogin(payload: GoogleLoginRequest): Promise<AuthResponse> {
    const result = await apiClient("/auth/google-login", {
        method: "POST",
        body: payload,
    });
    coreStore.invalidate(["Auth"]);
    return result;
}

/**
 * 4. GET /auth/me
 */
export function getProfile(): Promise<ProfileResponse> {
    return coreStore.fetchWithCache(
        "/auth/me",
        () => apiClient("/auth/me"),
        { ttl: 60000, tags: ["Auth"] as never[] }
    );
}

/**
 * 5. POST /auth/logout
 */
export async function logout(): Promise<CommonActionResponse> {
    const result = await apiClient("/auth/logout", {
        method: "POST",
    });
    coreStore.clear();
    return result;
}