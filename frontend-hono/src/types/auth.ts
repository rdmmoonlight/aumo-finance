// src/types/auth.ts

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    clientType?: "web" | "mobile";
}

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

export interface UserSchema {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    user?: UserSchema;
    token?: string;
    lockoutEnd?: string;
    errors?: Record<string, string[]>;
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