import { and, count, eq, gte, lte } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import type { Summary } from '../types/reports/summary.type.js';

// Pengganti ISummaryService / SummaryService C#

export class SummaryService {
    async getSummary(userId: string): Promise<Summary | null> {
        if (!userId) return null;

        // 1. Cari periode aktif - C# Where(p => p.UserId == uid && p.IsSelected)
        const selectedPeriod = await db.query.periods.findFirst({
            where: and(
                eq(schema.periods.userId, userId),
                eq(schema.periods.isSelected, true)
            ),
            columns: {
                id: true,
                periodName: true,
                startDate: true,
                endDate: true,
                isClosed: true
            }
        });

        // 2. Query jurnal berdasarkan rentang periode
        // C#: journalQuery = _context.JournalEntries.Where(j => j.UserId == uid)
        // if selectedPeriod != null -> Where EntryDate >= Start && <= End
        let journalCount = 0;

        if (selectedPeriod) {
            const result = await db
                .select({ count: count() })
                .from(schema.journalEntries)
                .where(
                    and(
                        eq(schema.journalEntries.userId, userId),
                        gte(schema.journalEntries.entryDate, selectedPeriod.startDate),
                        lte(schema.journalEntries.entryDate, selectedPeriod.endDate)
                    )
                );
            journalCount = result[0]?.count || 0;
        } else {
            const result = await db
                .select({ count: count() })
                .from(schema.journalEntries)
                .where(eq(schema.journalEntries.userId, userId));
            journalCount = result[0]?.count || 0;
        }

        // 3. Hitung COA aktif
        // C# aslinya CountAsync() tanpa filter (bug), tapi kita filter by userId + isActive yang benar
        const coaResult = await db
            .select({ count: count() })
            .from(schema.chartOfAccounts)
            .where(
                and(
                    eq(schema.chartOfAccounts.userId, userId),
                    eq(schema.chartOfAccounts.isActive, true)
                )
            );
        const activeCoaCount = coaResult[0]?.count || 0;

        return {
            selectedPeriodId: null, // C# selalu null (mungkin legacy)
            totalJournal: journalCount,
            activeCoa: activeCoaCount,
            activePeriodName: selectedPeriod?.periodName || 'Tidak Ada Periode Aktif',
            isPeriodOpen: selectedPeriod ? !selectedPeriod.isClosed : false,
            selectedPeriod: selectedPeriod
                ? {
                    id: String(selectedPeriod.id),
                    periodName: selectedPeriod.periodName,
                    startDate: selectedPeriod.startDate,
                    endDate: selectedPeriod.endDate,
                    isClosed: selectedPeriod.isClosed
                }
                : null
        };
    }

    // Versi yang pakai ClaimsPrincipal di C# -> di TS kita pakai userId langsung dari JWT middleware
    // Tapi untuk backward compat, sediakan method yang resolve dari claims juga
    async getSummaryFromClaims(claims: { sub?: string; nameId?: string; userId?: string }): Promise<Summary | null> {
        const userId = claims.sub || claims.nameId || claims.userId;
        if (!userId) {
            logger.warn({ claims }, 'Failed to resolve userId from claims for summary');
            return null;
        }
        return this.getSummary(userId);
    }
}

export const summaryService = new SummaryService();
