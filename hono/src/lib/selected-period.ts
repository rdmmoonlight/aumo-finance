import { eq } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';

// Pengganti AumoBackend.Helpers.SelectedPeriodHelper
// Di C# ini helper untuk manage selected period per user

export const selectedPeriodHelper = {
    async getSelectedPeriod(userId: string) {
        try {
            const setting = await db.query.userSettings.findFirst({
                where: eq(schema.userSettings.userId, userId),
                with: { selectedPeriod: true }
            } as any);

            const periodId = (setting as any)?.selectedPeriodId;
            if (!periodId) return null;

            return await db.query.periods.findFirst({
                where: eq(schema.periods.id, periodId)
            });
        } catch (err) {
            logger.warn({ err, userId }, 'Failed to get selected period');
            return null;
        }
    },

    async selectPeriod(userId: string, periodId: number) {
        try {
            // Upsert user_settings
            await db
                .insert(schema.userSettings)
                .values({
                    userId,
                    selectedPeriodId: periodId,
                } as any)
                .onConflictDoUpdate({
                    target: schema.userSettings.userId,
                    set: { selectedPeriodId: periodId, updatedAt: new Date() } as any
                });
        } catch (err) {
            logger.error({ err, userId, periodId }, 'Failed to select period');
            throw err;
        }
    },

    async clearSelection(userId: string) {
        try {
            await db
                .update(schema.userSettings)
                .set({ selectedPeriodId: null, updatedAt: new Date() } as any)
                .where(eq(schema.userSettings.userId, userId));
        } catch (err) {
            logger.warn({ err, userId }, 'Failed to clear period selection');
        }
    }
};
