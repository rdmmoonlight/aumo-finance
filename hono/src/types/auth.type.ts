import { z } from 'zod';

// ==========================================
// 1. Roles & Enums
// ==========================================
export type UserRole = 'user' | 'admin' | 'superadmin';

export const ActivityType = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    FAILED_LOGIN: 'FAILED_LOGIN',
    GOOGLE_LOGIN: 'GOOGLE_LOGIN',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
} as const;

// ==========================================
// 2. Zod Schemas (Single Source of Truth)
// ==========================================

export const loginRequestSchema = z.object({
    email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
    rememberMe: z.boolean().optional().default(false),
    isMobileClient: z.boolean().optional().default(false),
    userAgent: z.string().optional(),
    operatingSystem: z.string().optional(),
    clientType: z.enum(['web', 'mobile']).optional().default('web'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Untuk backward compat dengan nama lama loginSchema
export const loginSchema = loginRequestSchema;
export type LoginDTO = LoginRequest;

export const googleLoginRequestSchema = z.object({
    idToken: z.string().min(1, 'idToken wajib diisi'),
    isMobileClient: z.boolean().optional().default(false),
});
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;

// Aturan password bersama (register & ganti password)
export const passwordRule = z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password maksimal 128 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka');

export const registerSchema = z.object({
    email: z.string().trim().email('Format email tidak valid'),
    password: passwordRule,
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').optional().or(z.literal('')),
    clientType: z.enum(['web', 'mobile']).optional().default('web'),
});
export type RegisterDTO = z.infer<typeof registerSchema>;

export const resendRequestSchema = z.object({
    email: z.string().trim().email('Format email tidak valid'),
});
export type ResendRequest = z.infer<typeof resendRequestSchema>;

export const googleAuthUserSchema = z.object({
    email: z.string().trim().email('Format email tidak valid'),
    name: z.string().optional().nullable(),
    googleId: z.string().min(1, 'Google ID wajib diisi'),
    avatarUrl: z.string().url('Format URL avatar tidak valid').optional().nullable(),
});
export type GoogleAuthUserDTO = z.infer<typeof googleAuthUserSchema>;

export const mobileLoginRequestSchema = z.object({
    email: z.string().trim().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});
export type MobileLoginRequest = z.infer<typeof mobileLoginRequestSchema>;

// ==========================================
// 3. DB Entity & Safe Types
// ==========================================

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    userName?: string | null;
    name?: string | null;
    fullName?: string | null;
    role: UserRole;
    googleId?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    phoneNumber?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type SafeUser = Omit<User, 'passwordHash'>;

// ==========================================
// 4. Auth Context & JWT
// ==========================================

export type AuthenticatedContext = {
    userId: string;
    sessionId?: string;
};

export interface JwtPayload {
    sub: string; // userId
    email: string;
    name: string;
    jti: string; // jwt id / session id
    roles: string[];
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
    [key: string]: unknown;
}

export interface AuthUserPayload {
    userId: string;
    email: string;
    role: UserRole;
}

// ==========================================
// 5. Response DTOs (clean, no duplikat)
// ==========================================

export interface AuthResponseDto {
    success: boolean;
    message: string;
    userId?: string;
    fullName?: string;
    avatarUrl?: string | null;
    token?: string; // hanya untuk mobile JWT, web pakai cookie httpOnly
}

export interface MobileLoginResponse {
    success: boolean;
    message: string;
    token: string;
    userId: string;
    fullName: string;
}

export interface UserProfile {
    id: string;
    userId: string;
    email: string | null;
    userName: string | null;
    fullName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    bio: string | null;
    roles: string[];
    customClaims: { type: string; value: string }[];
}

// Converted from C#
export interface UserSessionDto {
    id: string;
    deviceName: string;
    operatingSystem: string;
    browser: string;
    userAgent: string;
    ipAddress: string;
    country: string;
    isActive: boolean;
    isCurrent: boolean;
    createdAt: string; // ISO
    lastActivityAt: string; // ISO
    revokedAt?: string | null;
}

export interface LoginActivityDto {
    id: string;
    activityType: string;
    device: string;
    operatingSystem: string;
    userAgent: string;
    browser: string;
    ipAddress: string;
    country: string;
    isSuccess: boolean;
    createdAt: string; // ISO
}


// ==========================================
// 6. Auth (Better Auth) - sesuai tabel user/session/account
// ==========================================

export const checkEmailQuerySchema = z.object({
    email: z.string().trim().email('Format email tidak valid'),
});
export type CheckEmailQuery = z.infer<typeof checkEmailQuerySchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: passwordRule,
    revokeOtherSessions: z.boolean().optional().default(true),
});
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

/** Kolom tabel "user" yang aman dikirim ke client */
export interface AuthUserDto {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

/** Kolom tabel "session" (tanpa token) untuk daftar perangkat aktif */
export interface AuthSessionDto {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string | Date;
    expiresAt: string | Date;
    isCurrent: boolean;
}
