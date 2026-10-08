import { z } from 'zod';

export interface UpdateProfileRequest {
    userName?: string;
    fullName: string;
    phoneNumber?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ServiceResult<T = any> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
    errors?: string[];
}

export const updateProfileSchema = z.object({
    userName: z.string().min(3).max(50).optional(),
    fullName: z.string().min(1).max(100),
    phoneNumber: z.string().max(20).nullable().optional(),
    bio: z.string().max(500).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional()
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100)
});

export interface LoginActivityViewModel {
    id: string;
    activityType: string;
    device: string;
    operatingSystem: string;
    browser: string;
    ipAddress: string;
    country: string;
    isSuccess: boolean;
    createdAt: Date;
}

export interface ActiveSessionViewModel {
    id: string;
    deviceName: string;
    operatingSystem: string;
    browser: string;
    ipAddress: string;
    country: string;
    isCurrent: boolean;
    lastActivityAt: Date;
}

export interface SecurityStatusViewModel {
    statusLevel: 'Good' | 'Warning' | 'Critical';
    activeSessionsCount: number;
    failedAttemptsLast24Hours: number;
    lastSuccessfulLogin?: Date;
}

export interface GuardianDashboardViewModel {
    securityStatus: SecurityStatusViewModel;
    recentActivities: LoginActivityViewModel[];
    activeSessions: ActiveSessionViewModel[];
}
