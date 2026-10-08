// --- Response DTOs ---
export interface AuthResponseDto {
    success: boolean;
    message: string;
    userId?: string;
    fullName?: string;
    avatarUrl?: string | null;
    token?: string; // hanya untuk mobile JWT, web pakai cookie httpOnly
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

export interface JwtPayload {
    sub: string; // userId
    email: string;
    name: string;
    jti: string;
    roles: string[];
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
    [key: string]: unknown;
}

// Untuk service internal kalau butuh
export type AuthenticatedContext = {
    userId: string;
    sessionId?: string;
};