import { z } from 'zod';

// 1. Profile - C# semua nullable, jadi di zod nullable().optional()
export const updateProfileRequestSchema = z.object({
    userName: z.string().min(3).max(50).nullable().optional(),
    fullName: z.string().min(1).max(100).nullable().optional(),
    phoneNumber: z.string().max(20).nullable().optional(),
    bio: z.string().max(500).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional().or(z.literal('')),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const changePasswordRequestSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
});
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

// 2. ServiceResult - gabung C# StatusCode + FE status + errors
export function createServiceResultSchema<T extends z.ZodTypeAny>(dataSchema: T) {
    return z.object({
        success: z.boolean(),
        status: z.number().int().optional(), // alias FE
        statusCode: z.number().int().default(200), // C#
        message: z.string().default(''),
        data: dataSchema.nullable().optional(),
        errors: z.array(z.string()).optional(),
    });
}
export const baseServiceResultSchema = createServiceResultSchema(z.any());
export type ServiceResult<T = any> = {
    success: boolean;
    status: number;
    statusCode: number;
    message: string;
    data?: T | null;
    errors?: string[];
};

// helper mirip C# ServiceResult.Ok() / BadRequest()
export const ServiceResultFactory = {
    Ok: <T>(message = '', data: T | null = null): ServiceResult<T> => ({
        success: true, status: 200, statusCode: 200, message, data,
    }),
    BadRequest: (message: string): ServiceResult => ({
        success: false, status: 400, statusCode: 400, message,
    }),
};

// 3. Guardian / Security ViewModels - yang nggak ada di C# tapi ada di FE
export const loginActivityViewModelSchema = z.object({
    id: z.string(),
    activityType: z.string(),
    device: z.string(),
    operatingSystem: z.string(),
    browser: z.string(),
    ipAddress: z.string(),
    country: z.string(),
    isSuccess: z.boolean(),
    createdAt: z.coerce.date(),
});
export type LoginActivityViewModel = z.infer<typeof loginActivityViewModelSchema>;

export const activeSessionViewModelSchema = z.object({
    id: z.string(),
    deviceName: z.string(),
    operatingSystem: z.string(),
    browser: z.string(),
    ipAddress: z.string(),
    country: z.string(),
    isCurrent: z.boolean(),
    lastActivityAt: z.coerce.date(),
});
export type ActiveSessionViewModel = z.infer<typeof activeSessionViewModelSchema>;

export const securityStatusViewModelSchema = z.object({
    statusLevel: z.enum(['Good', 'Warning', 'Critical']),
    activeSessionsCount: z.number().int(),
    failedAttemptsLast24Hours: z.number().int(),
    lastSuccessfulLogin: z.coerce.date().nullable().optional(),
});
export type SecurityStatusViewModel = z.infer<typeof securityStatusViewModelSchema>;

export const guardianDashboardViewModelSchema = z.object({
    securityStatus: securityStatusViewModelSchema,
    recentActivities: z.array(loginActivityViewModelSchema).default([]),
    activeSessions: z.array(activeSessionViewModelSchema).default([]),
});
export type GuardianDashboardViewModel = z.infer<typeof guardianDashboardViewModelSchema>;