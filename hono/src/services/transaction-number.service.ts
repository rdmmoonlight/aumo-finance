import { and, eq, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

// Pengganti ITransactionNumberService + TransactionNumberService C#
// Menggunakan raw SQL upsert untuk atomic counter (sama persis dengan C#)

export class TransactionNumberService {
    /**
     * Generate nomor transaksi atomically
     * C#: INSERT ... ON CONFLICT DO UPDATE RETURNING LastSequence
     */
    async generate(userId: string, journalType: string, entryDate: Date): Promise<string> {
        const prefix = journalType === 'Adjusting' ? 'AJ' : 'GJ';
        const yyMM = this.formatYYMM(entryDate);
        const counterKey = `${prefix}${yyMM}`;

        // Raw SQL upsert - atomic seperti di C#
        const result = await db.execute(sql`
      INSERT INTO transaction_counters (user_id, counter_key, last_sequence)
      VALUES (${userId}, ${counterKey}, 1)
      ON CONFLICT (user_id, counter_key)
      DO UPDATE SET last_sequence = transaction_counters.last_sequence + 1
      RETURNING last_sequence;
    `);

        // Drizzle execute return tergantung driver, handle both
        const rows = (result as any).rows || result as any[];
        const lastSeq = rows[0]?.last_sequence ?? rows[0]?.lastSequence ?? (result as any)[0]?.last_sequence;

        const nextSeq = Number(lastSeq);
        if (!nextSeq) {
            throw new AppError(`Transaction counter upsert for ${counterKey} returned no result.`, 500);
        }

        if (nextSeq > 9999) {
            throw new AppError(`Transaction number sequence for ${counterKey} has reached its 9999 capacity.`, 400);
        }

        const transactionNumber = `${counterKey}${String(nextSeq).padStart(4, '0')}`;
        logger.info({ userId, counterKey, transactionNumber }, 'Generated transaction number');

        return transactionNumber;
    }

    /**
     * Peek nomor selanjutnya tanpa increment
     */
    async peekNext(userId: string, journalType: string, entryDate: Date): Promise<string> {
        const prefix = journalType === 'Adjusting' ? 'AJ' : 'GJ';
        const yyMM = this.formatYYMM(entryDate);
        const counterKey = `${prefix}${yyMM}`;

        const current = await db.query.transactionCounters.findFirst({
            where: and(
                eq(schema.transactionCounters.userId, userId),
                eq(schema.transactionCounters.counterKey, counterKey)
            )
        });

        const previewSeq = (current?.lastSequence ?? 0) + 1;
        return `${counterKey}${String(previewSeq).padStart(4, '0')}`;
    }

    private formatYYMM(date: Date): string {
        const d = new Date(date);
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${yy}${mm}`;
    }
}

export const transactionNumberService = new TransactionNumberService();
