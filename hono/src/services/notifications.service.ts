import { and, desc, eq } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import { logger } from '../lib/logger.js';
import type { Notification } from '../types/notification.type.js';

// Pengganti INotificationsService / NotificationsService C#

export class NotificationsService {
    async getByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
        const rows = await db.query.notifications.findMany({
            where: eq(schema.notifications.userId, userId),
            orderBy: [desc(schema.notifications.createdAt)],
            limit
        });

        return rows.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            targetUrl: n.targetUrl || null,
            createdAt: new Date(n.createdAt).toISOString() // C# ToString("o") = ISO 8601
        }));
    }

    async markAsRead(id: string, userId: string): Promise<boolean> {
        const notification = await db.query.notifications.findFirst({
            where: and(
                eq(schema.notifications.id, id),
                eq(schema.notifications.userId, userId)
            )
        });

        if (!notification) return false;

        await db
            .update(schema.notifications)
            .set({ isRead: true } as any)
            .where(eq(schema.notifications.id, id));

        logger.info({ id, userId }, 'Notification marked as read');
        return true;
    }

    async markAllAsRead(userId: string): Promise<void> {
        // C# ExecuteUpdateAsync(s => SetProperty(n => n.IsRead, true))
        await db
            .update(schema.notifications)
            .set({ isRead: true } as any)
            .where(
                and(
                    eq(schema.notifications.userId, userId),
                    eq(schema.notifications.isRead, false)
                )
            );

        logger.info({ userId }, 'All notifications marked as read');
    }

    // Bonus: create notification (tidak ada di C# tapi berguna di TS)
    async create(data: {
        userId: string;
        title: string;
        message: string;
        type?: string;
        targetUrl?: string;
    }): Promise<Notification> {
        const [row] = await db
            .insert(schema.notifications)
            .values({
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || 'info',
                targetUrl: data.targetUrl || null,
                isRead: false
            } as any)
            .returning();

        return {
            id: row.id,
            title: row.title,
            message: row.message,
            type: row.type,
            isRead: row.isRead,
            targetUrl: row.targetUrl || null,
            createdAt: new Date(row.createdAt).toISOString()
        };
    }
}

export const notificationsService = new NotificationsService();
