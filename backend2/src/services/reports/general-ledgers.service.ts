import { logger } from '../../lib/logger.js';

// Stub pengganti IGeneralLedgersService
// Di C# ini service untuk refresh staging table general ledgers per selected period
// Untuk migrasi awal, kita bikin no-op, nanti bisa diisi logic report

export const generalLedgersService = {
    async refreshGeneralLedgers(userId: string) {
        logger.info({ userId }, 'Refreshing general ledgers staging for selected period');
        // TODO: Implementasi regenerasi staging table
        // Di C# asli: _glService.RefreshGeneralLedgersAsync(userId)
        // Biasanya: delete staging where userId, then insert aggregated journal lines for selected period
        try {
            // Contoh implementasi minimal (hapus dulu jika ada tabel staging)
            // await db.delete(schema.generalLedgersStaging).where(eq(schema.generalLedgersStaging.userId, userId));
            // ... insert logic ...
        } catch (err) {
            logger.warn({ err, userId }, 'Failed to refresh general ledgers - continuing');
        }
    },

    async clearSelectedPeriodLedgers(userId: string) {
        logger.info({ userId }, 'Clearing general ledgers staging');
        try {
            // await db.delete(schema.generalLedgersStaging).where(eq(schema.generalLedgersStaging.userId, userId));
        } catch (err) {
            logger.warn({ err, userId }, 'Failed to clear ledgers staging');
        }
    }
};