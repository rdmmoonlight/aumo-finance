import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { avatarStorage } from '../lib/avatar-storage.js';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import type {
    ChangePasswordRequest,
    GuardianDashboardViewModel,
    ServiceResult,
    UpdateProfileRequest
} from '../types/settings.type.js';
import { guardianService } from './guardian.service.js';

// Pengganti ISettingsService / SettingsService C#

function ok<T>(message: string, data?: T): ServiceResult<T> {
    return { success: true, status: 200, message, data };
}
function badRequest(message: string): ServiceResult {
    return { success: false, status: 400, message };
}
function unauthorized(): ServiceResult {
    return { success: false, status: 401, message: 'Unauthorized' };
}
function internalError(message: string): ServiceResult {
    return { success: false, status: 500, message };
}

export class SettingsService {
    async updateProfile(userId: string, request: UpdateProfileRequest): Promise<ServiceResult> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        // Username change - cek unique seperti UserManager.SetUserNameAsync
        if (request.userName && request.userName.trim() !== '' && request.userName !== user.userName) {
            const existing = await db.query.users.findFirst({
                where: eq(schema.users.userName, request.userName)
            });
            if (existing) {
                return badRequest(`Username ${request.userName} sudah digunakan`);
            }
            await db.update(schema.users).set({ userName: request.userName } as any).where(eq(schema.users.id, userId));
        }

        // PhoneNumber change - seperti SetPhoneNumberAsync
        if (request.phoneNumber !== undefined && request.phoneNumber !== user.phoneNumber) {
            await db.update(schema.users).set({ phoneNumber: request.phoneNumber || null } as any).where(eq(schema.users.id, userId));
        }

        // FullName, Bio, AvatarUrl
        const updates: any = {};
        if (request.fullName !== undefined) updates.fullName = request.fullName;
        if (request.bio !== undefined) updates.bio = request.bio;
        if (request.avatarUrl && request.avatarUrl.trim() !== '') {
            updates.avatarUrl = request.avatarUrl;
        }
        updates.updatedAt = new Date();

        if (Object.keys(updates).length > 0) {
            const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, userId)).returning();
            if (!result.length) return badRequest('Failed to update profile');
        }

        return ok('Profile updated successfully.');
    }

    async uploadAvatar(
        userId: string,
        file: { buffer: Buffer; originalName: string; size: number; mimeType?: string } | null
    ): Promise<ServiceResult<{ avatarUrl: string }>> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        if (!file || file.size === 0) {
            return badRequest("No file uploaded. Ensure the form-data key is named 'file' or 'avatar'.");
        }

        if (file.size > 2 * 1024 * 1024) {
            return badRequest('File size exceeds limit (Max 2MB).');
        }

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = file.originalName.toLowerCase().substring(file.originalName.lastIndexOf('.'));

        if (!ext || !allowedExtensions.includes(ext)) {
            return badRequest('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.');
        }

        if (!avatarStorage.isConfigured) {
            // Di dev mode, izinkan upload lokal
            if (process.env.NODE_ENV === 'production') {
                return internalError('Neon bucket belum dikonfigurasi di server.');
            }
        }

        try {
            const fileName = `avatar_${user.id}_${crypto.randomUUID()}${ext}`;

            const publicUrl = await avatarStorage.uploadAvatar(fileName, file.buffer);

            await db.update(schema.users).set({ avatarUrl: publicUrl, updatedAt: new Date() } as any).where(eq(schema.users.id, userId));

            return ok('Avatar uploaded successfully.', { avatarUrl: publicUrl });
        } catch (err: any) {
            logger.error({ err, userId }, 'Avatar upload error');
            return internalError(`Avatar upload error: ${err.message}`);
        }
    }

    async changePassword(userId: string, request: ChangePasswordRequest): Promise<ServiceResult> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        if (!user.passwordHash) {
            return badRequest('Akun ini tidak memiliki password (login via Google)');
        }

        const isCurrentValid = await bcrypt.compare(request.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            return badRequest('Current password is incorrect');
        }

        const newHash = await bcrypt.hash(request.newPassword, 12);
        await db.update(schema.users).set({ passwordHash: newHash, updatedAt: new Date() } as any).where(eq(schema.users.id, userId));

        return ok('Password successfully updated.');
    }

    async deleteAccount(userId: string): Promise<ServiceResult> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        await guardianService.revokeAllSessions(userId);

        await db.delete(schema.users).where(eq(schema.users.id, userId));

        // SignOut ditangani di route layer (clear cookie / revoke JWT)
        return ok('Account successfully deleted.');
    }

    async getGuardianDashboard(userId: string, currentSessionId?: string): Promise<ServiceResult<GuardianDashboardViewModel>> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        const activeSessions = await guardianService.getActiveSessions(userId);
        const loginActivities = await guardianService.getLoginActivities(userId, 50);

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const failedAttempts = loginActivities.filter(a => !a.isSuccess && new Date(a.createdAt) >= oneDayAgo).length;
        const lastSuccess = loginActivities.find(a => a.isSuccess)?.createdAt;

        const dashboard: GuardianDashboardViewModel = {
            securityStatus: {
                statusLevel: failedAttempts > 3 ? 'Warning' : 'Good',
                activeSessionsCount: activeSessions.length,
                failedAttemptsLast24Hours: failedAttempts,
                lastSuccessfulLogin: lastSuccess ? new Date(lastSuccess) : undefined
            },
            recentActivities: loginActivities.map((a: any) => ({
                id: a.id,
                activityType: a.activityType || a.activity || 'Unknown',
                device: a.device || a.deviceName || 'Unknown',
                operatingSystem: a.operatingSystem || a.os || 'Unknown',
                browser: a.browser || 'Unknown',
                ipAddress: a.ipAddress || '',
                country: a.country || 'ID',
                isSuccess: a.isSuccess ?? a.success ?? true,
                createdAt: new Date(a.createdAt)
            })),
            activeSessions: activeSessions.map((s: any) => ({
                id: s.id,
                deviceName: s.deviceName || s.device || 'Unknown',
                operatingSystem: s.operatingSystem || s.os || 'Unknown',
                browser: s.browser || 'Unknown',
                ipAddress: s.ipAddress || '',
                country: s.country || 'ID',
                isCurrent: currentSessionId ? s.id === currentSessionId : false,
                lastActivityAt: new Date(s.lastActivityAt || s.updatedAt || s.createdAt)
            }))
        };

        return ok('Guardian dashboard', dashboard);
    }

    async revokeSession(userId: string, sessionId: string): Promise<ServiceResult> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        await guardianService.revokeSession(sessionId, userId);
        return ok('Session revoked.');
    }

    async revokeAllSessions(userId: string, currentSessionId?: string): Promise<ServiceResult> {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });
        if (!user) return unauthorized();

        await guardianService.revokeAllSessions(userId, currentSessionId);
        return ok('All other sessions revoked.');
    }
}

export const settingsService = new SettingsService();
