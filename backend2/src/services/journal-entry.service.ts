import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { db } from '../lib/db.js';
import { BadRequestError, LockedError, NotFoundError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { isDateLocked } from '../lib/period-lock.js';
import type {
    CreateJournalEntryRequest,
    CreateJournalEntryResponse,
    JournalEntryLineDto,
    JournalEntryResponse,
    UpdateJournalEntryRequest
} from '../types/journal-entry.type.js';
import { transactionNumberService } from './transaction-number.service.js';

export class JournalEntryService {
    async getById(userId: string, id: number): Promise<JournalEntryResponse | null> {
        const entry = await db.query.journalEntries.findFirst({
            where: and(
                eq(schema.journalEntries.id, id),
                eq(schema.journalEntries.userId, userId)
            ),
            with: {
                lines: {
                    orderBy: [asc(schema.journalEntryLines.lineOrder)]
                }
            }
        });

        if (!entry) return null;

        const closedPeriods = await db.query.periods.findMany({
            where: and(
                eq(schema.periods.userId, userId),
                eq(schema.periods.isClosed, true)
            )
        });

        const isLocked = isDateLocked(entry.entryDate, closedPeriods);

        return {
            id: entry.id,
            transactionNumber: entry.transactionNumber,
            journalType: entry.journalType,
            entryDate: entry.entryDate,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt || null,
            isLocked,
            lines: entry.lines.map(l => ({
                id: l.id,
                accountId: l.accountId,
                lineDescription: l.lineDescription,
                debit: Number(l.debit),
                credit: Number(l.credit),
                lineOrder: l.lineOrder
            }))
        };
    }

    async create(userId: string, request: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse> {
        const effectiveLines = this.validateAndExtractLines(request.lines);
        await this.validateAccounts(userId, effectiveLines);

        const closedPeriods = await db.query.periods.findMany({
            where: and(
                eq(schema.periods.userId, userId),
                eq(schema.periods.isClosed, true)
            )
        });

        if (isDateLocked(request.entryDate, closedPeriods)) {
            throw new LockedError('This date falls within a closed accounting period. Choose a date in an open period.');
        }

        const journalType = request.journalType?.trim() || 'General';
        const transactionNumber = await transactionNumberService.generate(userId, journalType, request.entryDate);

        const deviceCreatedAt = request.createdAt ? new Date(request.createdAt) : new Date();

        // Drizzle transaction - equivalent to SaveChangesAsync atomic
        const result = await db.transaction(async (tx) => {
            const [entry] = await tx.insert(schema.journalEntries).values({
                userId,
                transactionNumber,
                journalType,
                entryDate: new Date(request.entryDate),
                createdAt: deviceCreatedAt,
            }).returning();

            const linesToInsert = effectiveLines.map((l, index) => ({
                journalEntryId: entry.id,
                accountId: l.accountId,
                lineDescription: l.lineDescription || null,
                debit: String(l.debit),
                credit: String(l.credit),
                lineOrder: index
            }));

            await tx.insert(schema.journalEntryLines).values(linesToInsert as any);

            return entry;
        });

        logger.info({ userId, transactionNumber }, 'Journal entry created');

        return {
            entryId: result.id,
            transactionNumber: result.transactionNumber,
            message: `Journal entry ${result.transactionNumber} has been posted.`
        };
    }

    async update(userId: string, id: number, request: UpdateJournalEntryRequest): Promise<void> {
        const entry = await db.query.journalEntries.findFirst({
            where: and(
                eq(schema.journalEntries.id, id),
                eq(schema.journalEntries.userId, userId)
            ),
            with: { lines: true }
        });

        if (!entry) {
            throw new NotFoundError('Journal entry not found.');
        }

        const closedPeriods = await db.query.periods.findMany({
            where: and(
                eq(schema.periods.userId, userId),
                eq(schema.periods.isClosed, true)
            )
        });

        if (isDateLocked(entry.entryDate, closedPeriods) || isDateLocked(request.entryDate, closedPeriods)) {
            throw new LockedError(`Journal entry ${entry.transactionNumber} falls within a closed period and cannot be modified.`);
        }

        const effectiveLines = this.validateAndExtractLines(request.lines);
        await this.validateAccounts(userId, effectiveLines);

        const journalType = request.journalType?.trim() || entry.journalType;
        const deviceUpdatedAt = request.updatedAt ? new Date(request.updatedAt) : new Date();

        await db.transaction(async (tx) => {
            await tx.update(schema.journalEntries).set({
                journalType,
                entryDate: new Date(request.entryDate),
                updatedAt: deviceUpdatedAt
            }).where(eq(schema.journalEntries.id, id));

            // Remove old lines - equivalent to RemoveRange
            await tx.delete(schema.journalEntryLines).where(eq(schema.journalEntryLines.journalEntryId, id));

            const newLines = effectiveLines.map((l, index) => ({
                journalEntryId: id,
                accountId: l.accountId,
                lineDescription: l.lineDescription || null,
                debit: String(l.debit),
                credit: String(l.credit),
                lineOrder: index
            }));

            await tx.insert(schema.journalEntryLines).values(newLines as any);
        });

        logger.info({ userId, id }, 'Journal entry updated');
    }

    async delete(userId: string, id: number): Promise<void> {
        const entry = await db.query.journalEntries.findFirst({
            where: and(
                eq(schema.journalEntries.id, id),
                eq(schema.journalEntries.userId, userId)
            )
        });

        if (!entry) {
            throw new NotFoundError('Journal entry not found.');
        }

        const closedPeriods = await db.query.periods.findMany({
            where: and(
                eq(schema.periods.userId, userId),
                eq(schema.periods.isClosed, true)
            )
        });

        if (isDateLocked(entry.entryDate, closedPeriods)) {
            throw new LockedError('Cannot delete transactions in closed accounting periods.');
        }

        await db.delete(schema.journalEntries).where(eq(schema.journalEntries.id, id));
        logger.info({ userId, id }, 'Journal entry deleted');
    }

    async searchDescriptions(userId: string, query: string): Promise<string[]> {
        if (!query?.trim() || query.trim().length < 2) {
            return [];
        }

        const keyword = `%${query.trim()}%`;

        // Group by description, order by count desc, then max id desc, take 8
        // Equivalent to C#: GroupBy, OrderByDescending Count, ThenByDescending Max(Id)
        const results = await db
            .select({
                description: schema.journalEntryLines.lineDescription,
                count: sql<number>`count(*)`.as('count'),
                maxId: sql<number>`max(${schema.journalEntryLines.id})`.as('max_id')
            })
            .from(schema.journalEntryLines)
            .innerJoin(
                schema.journalEntries,
                eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id)
            )
            .where(
                and(
                    eq(schema.journalEntries.userId, userId),
                    sql`${schema.journalEntryLines.lineDescription} IS NOT NULL AND ${schema.journalEntryLines.lineDescription} != ''`,
                    ilike(schema.journalEntryLines.lineDescription, keyword)
                )
            )
            .groupBy(schema.journalEntryLines.lineDescription)
            .orderBy(desc(sql`count(*)`), desc(sql`max(${schema.journalEntryLines.id})`))
            .limit(8);

        return results.map(r => r.description!).filter(Boolean);
    }

    async getNextTransactionNumber(userId: string, journalType: string, entryDate?: Date | null): Promise<string> {
        const type = journalType?.trim() || 'General';
        return await transactionNumberService.peekNext(userId, type, entryDate || new Date());
    }

    // === Private helpers - sama persis dengan C# ===

    private validateAndExtractLines(lines: JournalEntryLineDto[]): JournalEntryLineDto[] {
        const effectiveLines = lines.filter(l => l.accountId !== 0 && (l.debit !== 0 || l.credit !== 0));

        if (effectiveLines.length < 2) {
            throw new BadRequestError('A journal entry must have at least two line items.');
        }

        const totalDebit = effectiveLines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredit = effectiveLines.reduce((sum, l) => sum + l.credit, 0);

        // Pakai toleransi float untuk JS (C# decimal exact)
        if (Math.abs(totalDebit - totalCredit) > 0.01 || totalDebit === 0) {
            throw new BadRequestError('Total debit must equal total credit before posting.');
        }

        return effectiveLines;
    }

    private async validateAccounts(userId: string, lines: JournalEntryLineDto[]): Promise<void> {
        const validAccounts = await db.query.chartOfAccounts.findMany({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.isActive, true)
            ),
            columns: { id: true }
        });

        const validIds = new Set(validAccounts.map(a => a.id));

        if (lines.some(l => !validIds.has(l.accountId))) {
            throw new BadRequestError('One or more selected accounts are invalid or inactive.');
        }
    }
}

export const journalEntryService = new JournalEntryService();
