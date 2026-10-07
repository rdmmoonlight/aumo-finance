import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';

// Menggantikan IGuardianService di C#
export const guardianService = {
    async createSession(data: {
        userId: string;
        deviceName: string;
        os: string;
        browser: string;
        ipAddress: string;
        country: string;
        sessionType: string;
        userAgent: string;
    }) {
        const [session] = await db.insert(schema.sessions).values({
            userId: data.userId,
            deviceName: data.deviceName,
            os: data.os,
            browser: data.browser,
            ipAddress: data.ipAddress,
            country: data.country,
            sessionType: data.sessionType,
            userAgent: data.userAgent,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
        }).returning();
        return session;
    },

    async createLoginActivity(data: {
        userId: string;
        activity: string;
        deviceName: string;
        browser: string;
        ipAddress: string;
        country: string;
        success: boolean;
        os: string;
        userAgent: string;
    }) {
        const [activity] = await db.insert(schema.loginActivities).values({
            userId: data.userId,
            activity: data.activity,
            deviceName: data.deviceName,
            browser: data.browser,
            ipAddress: data.ipAddress,
            country: data.country,
            success: data.success,
            os: data.os,
            userAgent: data.userAgent
        }).returning();
        return activity;
    }
};
