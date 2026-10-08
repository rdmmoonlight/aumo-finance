import { z } from 'zod';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    targetUrl: string | null;
    createdAt: string; // ISO "o" format
}

export const notificationQuerySchema = z.object({
    limit: z.number().int().min(1).max(100).optional().default(20)
});

export const markAsReadSchema = z.object({
    id: z.string().uuid()
});
