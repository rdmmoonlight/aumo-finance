// src/types/settings.ts

export interface UpdateProfileRequest {
    fullName?: string | null;
    userName?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
}

export interface RevokeSessionArg {
    sessionId: string;
}