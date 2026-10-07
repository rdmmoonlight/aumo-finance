import { z } from 'zod';

// --- Request DTOs (migrasi dari AumoBackend.DTOs) ---
export const loginRequestSchema = z.object({
    email: z.string().min(1).email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional().default(false),
    isMobileClient: z.boolean().optional().default(false),
    userAgent: z.string().optional(),
    operatingSystem: z.string().optional()
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const googleLoginRequestSchema = z.object({
    idToken: z.string().min(1),
    isMobileClient: z.boolean().optional().default(false)
});
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;

// --- Response DTOs ---
export interface AuthResponseDto {
    success: boolean;
    message: string;
    userId?: string;
    fullName?: string;
    avatarUrl?: string | null;
    token?: string; // hanya untuk mobile JWT
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

// Untuk route layer
export type AuthenticatedContext = {
    userId: string;
    sessionId?: string;
};
