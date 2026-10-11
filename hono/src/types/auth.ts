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
// 2. Request & DTO Types
// ==========================================

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    isMobileClient?: boolean;
    userAgent?: string;
    operatingSystem?: string;
    clientType?: 'web' | 'mobile';
}

// Untuk backward compat dengan nama lama
export type LoginDTO = LoginRequest;

export interface GoogleLoginRequest {
    idToken: string;
    isMobileClient?: boolean;
}

export interface RegisterDTO {
    email: string;
    password: string;
    name?: string;
    clientType?: 'web' | 'mobile';
}

export interface ResendRequest {
    email: string;
}

export interface GoogleAuthUserDTO {
    email: string;
    name?: string | null;
    googleId: string;
    avatarUrl?: string | null;
}

export interface MobileLoginRequest {
    email: string;
    password: string;
}

export interface CheckEmailQuery {
    email: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
}

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

export type RawUser = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
};

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

/** Hasil operasi auth: data + header Set-Cookie dari Better Auth (untuk web). */
export interface AuthResult {
    user: AuthUserDto;
    /** Token sesi (hanya diteruskan ke client mobile). */
    token: string | null;
    setCookies: string[];
}
