// general-journal.service.ts
import { and, asc, eq, isNotNull, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema/general-journal';

type DrizzleDb = NodePgDatabase<typeof schema>;
type Tx = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0];
type DbOrTx = DrizzleDb | Tx;

// --- DTOs ---
export type JournalEntryLineDto = {
    accountId: number;
    lineDescription?: string | null;
    debit: number;
    credit: number;
}
export type CreateJournalEntryRequest = {
    journalType?: string;
    entryDate: Date;
    createdAt?: Date;
    lines: JournalEntryLineDto[];
}
export type UpdateJournalEntryRequest = {
    journalType?: string;
    entryDate: Date;
    updatedAt?: Date;
    lines: JournalEntryLineDto[];
}
export type JournalEntryLineResponseDto = {
    id: number;
    accountId: number;
    lineDescription: string | null;
    debit: string;
    credit: string;
    lineOrder: number;
}
export type JournalEntryResponseDto = {
    id: number; // id baris pertama dari group
    transactionNumber: string;
    journalType: string;
    entryDate: Date;
    createdAt: Date;
    updatedAt: Date | null;
    isLocked: boolean;
    lines: JournalEntryLineResponseDto[];
}
export type CreateJournalEntryResponseDto = {
    entryId: number;
    transactionNumber: string;
    message: string;
}

function isDateLocked(entryDate: Date, closedPeriods: { startDate: Date; endDate: Date }[]): boolean {
    const d = new Date(entryDate);
    return closedPeriods.some(p => {
        const start = new Date(p.startDate); start.setUTCHours(0, 0, 0, 0);
        const end = new Date(p.endDate); end.setUTCHours(23, 59, 59, 999);
        return d >= start && d <= end;
    });
}
function validateAndExtractLines(lines: JournalEntryLineDto[]): JournalEntryLineDto[] {
    const effective = lines.filter(l => l.accountId !== 0 && (l.debit !== 0 || l.credit !== 0));
    if (effective.length < 2) throw new Error('A journal entry must have at least two line items.');
    const totalDebit = effective.reduce((s, l) => s + Number(l.debit), 0);
    const totalCredit = effective.reduce((s, l) => s + Number(l.credit), 0);
    if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100) || totalDebit === 0) throw new Error('Total debit must equal total credit before posting.');
    return effective;
}
function toCounterKey(journalType: string, entryDate: Date): string {
    const prefix = journalType === 'Adjusting' ? 'AJ' : 'GJ';
    const yy = String(entryDate.getFullYear()).slice(-2);
    const mm = String(entryDate.getMonth() + 1).padStart(2, '0');
    return `${prefix}${yy}${mm}`;
}

export class GeneralJournalService {
    constructor(private db: DrizzleDb) { }

    private async generateTx(dbOrTx: DbOrTx, userId: string, journalType: string, entryDate: Date): Promise<string> {
        const type = journalType?.trim() ? journalType : 'General';
        const counterKey = toCounterKey(type, entryDate);
        const [row] = await (dbOrTx as any)
            .insert(schema.transactionCounters)
            .values({ userId, counterKey, lastSequence: 1 })
            .onConflictDoUpdate({
                target: [schema.transactionCounters.userId, schema.transactionCounters.counterKey],
                set: { lastSequence: sql`${schema.transactionCounters.lastSequence} + 1` },
            })
            .returning({ lastSequence: schema.transactionCounters.lastSequence });
        if (!row) throw new Error(`Counter ${counterKey} failed`);
        if (row.lastSequence > 9999) throw new Error(`Sequence ${counterKey} reached 9999`);
        return `${counterKey}${String(row.lastSequence).padStart(4, '0')}`;
    }

    async generate(userId: string, journalType: string, entryDate: Date) {
        return this.generateTx(this.db, userId, journalType, entryDate);
    }
    async peekNext(userId: string, journalType: string, entryDate: Date) {
        const counterKey = toCounterKey(journalType?.trim() ? journalType : 'General', entryDate);
        const [cur] = await (this.db as any).select({ lastSequence: schema.transactionCounters.lastSequence })
            .from(schema.transactionCounters)
            .where(and(eq(schema.transactionCounters.userId, userId), eq(schema.transactionCounters.counterKey, counterKey))).limit(1);
        return `${counterKey}${String((cur?.lastSequence ?? 0) + 1).padStart(4, '0')}`;
    }
    async getNextTransactionNumber(userId: string, journalType: string, entryDate?: Date | null) {
        return this.peekNext(userId, journalType, entryDate ?? new Date());
    }

    private async getClosedPeriods(dbOrTx: DbOrTx, userId: string) {
        return await (dbOrTx as any).select().from(schema.periods)
            .where(and(eq(schema.periods.userId, userId), eq(schema.periods.isClosed, true)));
    }
    private async validateAccounts(dbOrTx: DbOrTx, userId: string, lines: JournalEntryLineDto[]) {
        const validIds = await (dbOrTx as any).select({ id: schema.chartOfAccounts.id })
            .from(schema.chartOfAccounts)
            .where(and(eq(schema.chartOfAccounts.userId, userId), eq(schema.chartOfAccounts.isActive, true)));
        const set = new Set(validIds.map((r: any) => r.id));
        if (lines.some(l => !set.has(l.accountId))) throw new Error('One or more selected accounts are invalid or inactive.');
    }

    // id = salah satu id baris, kita ambil semua baris dengan transactionNumber yang sama
    async getById(userId: string, id: number): Promise<JournalEntryResponseDto | null> {
        const anchor = await this.db.query.generalJournals.findFirst({
            where: and(eq(schema.generalJournals.id, id), eq(schema.generalJournals.userId, userId)),
        });
        if (!anchor) return null;

        const rows = await (this.db as any).select().from(schema.generalJournals)
            .where(and(eq(schema.generalJournals.userId, userId), eq(schema.generalJournals.transactionNumber, anchor.transactionNumber)))
            .orderBy(asc(schema.generalJournals.lineOrder));

        if (rows.length === 0) return null;
        const closedPeriods = await this.getClosedPeriods(this.db, userId);

        return {
            id: rows[0].id, // representatif group
            transactionNumber: anchor.transactionNumber,
            journalType: anchor.journalType,
            entryDate: anchor.entryDate,
            createdAt: anchor.createdAt,
            updatedAt: anchor.updatedAt,
            isLocked: isDateLocked(anchor.entryDate, closedPeriods),
            lines: rows.map((r: any) => ({
                id: r.id,
                accountId: r.accountId,
                lineDescription: r.lineDescription,
                debit: String(r.debit),
                credit: String(r.credit),
                lineOrder: r.lineOrder,
            })),
        };
    }

    async create(userId: string, req: CreateJournalEntryRequest): Promise<CreateJournalEntryResponseDto> {
        const effectiveLines = validateAndExtractLines(req.lines);
        return await this.db.transaction(async (tx) => {
            await this.validateAccounts(tx, userId, effectiveLines);
            const closed = await this.getClosedPeriods(tx, userId);
            if (isDateLocked(req.entryDate, closed)) throw new Error('This date falls within a closed accounting period.');

            const journalType = req.journalType?.trim() ? req.journalType : 'General';
            const trxNumber = await this.generateTx(tx, userId, journalType, req.entryDate);
            const entryDateUTC = new Date(Date.UTC(req.entryDate.getFullYear(), req.entryDate.getMonth(), req.entryDate.getDate()));
            const createdAt = req.createdAt && req.createdAt.getTime() !== 0 ? req.createdAt : new Date();

            const inserted = await tx.insert(schema.generalJournals).values(
                effectiveLines.map((l, i) => ({
                    userId,
                    transactionNumber: trxNumber,
                    journalType,
                    entryDate: entryDateUTC,
                    accountId: l.accountId,
                    lineDescription: l.lineDescription ?? null,
                    debit: String(l.debit),
                    credit: String(l.credit),
                    lineOrder: i,
                    createdAt,
                }))
            ).returning({ id: schema.generalJournals.id });

            return { entryId: inserted[0].id, transactionNumber: trxNumber, message: `Journal entry ${trxNumber} has been posted.` };
        });
    }

    async update(userId: string, id: number, req: UpdateJournalEntryRequest): Promise<void> {
        await this.db.transaction(async (tx) => {
            const anchor = await tx.query.generalJournals.findFirst({
                where: and(eq(schema.generalJournals.id, id), eq(schema.generalJournals.userId, userId)),
            });
            if (!anchor) throw new Error('Journal entry not found.');

            const closed = await this.getClosedPeriods(tx, userId);
            if (isDateLocked(anchor.entryDate, closed) || isDateLocked(req.entryDate, closed)) {
                throw new Error(`Journal entry ${anchor.transactionNumber} falls within a closed period and cannot be modified.`);
            }

            const effectiveLines = validateAndExtractLines(req.lines);
            await this.validateAccounts(tx, userId, effectiveLines);

            // hapus semua baris dengan trxNumber yang sama
            await tx.delete(schema.generalJournals)
                .where(and(eq(schema.generalJournals.userId, userId), eq(schema.generalJournals.transactionNumber, anchor.transactionNumber)));

            const entryDateUTC = new Date(Date.UTC(req.entryDate.getFullYear(), req.entryDate.getMonth(), req.entryDate.getDate()));
            const updatedAt = req.updatedAt && req.updatedAt.getTime() !== 0 ? req.updatedAt : new Date();

            await tx.insert(schema.generalJournals).values(
                effectiveLines.map((l, i) => ({
                    userId,
                    transactionNumber: anchor.transactionNumber, // pertahankan nomor yang sama
                    journalType: req.journalType?.trim() ? req.journalType : anchor.journalType,
                    entryDate: entryDateUTC,
                    accountId: l.accountId,
                    lineDescription: l.lineDescription ?? null,
                    debit: String(l.debit),
                    credit: String(l.credit),
                    lineOrder: i,
                    createdAt: anchor.createdAt,
                    updatedAt,
                }))
            );
        });
    }

    async delete(userId: string, id: number): Promise<void> {
        const anchor = await this.db.query.generalJournals.findFirst({
            where: and(eq(schema.generalJournals.id, id), eq(schema.generalJournals.userId, userId)),
        });
        if (!anchor) throw new Error('Journal entry not found.');
        const closed = await this.getClosedPeriods(this.db, userId);
        if (isDateLocked(anchor.entryDate, closed)) throw new Error('Cannot delete transactions in closed accounting periods.');

        await this.db.delete(schema.generalJournals)
            .where(and(eq(schema.generalJournals.userId, userId), eq(schema.generalJournals.transactionNumber, anchor.transactionNumber)));
    }

    async searchDescriptions(userId: string, query: string): Promise<string[]> {
        if (!query?.trim() || query.trim().length < 2) return [];
        const kw = `%${query.trim()}%`;
        const rows = await this.db.select({
            description: schema.generalJournals.lineDescription,
            count: sql<number>`count(*)`.mapWith(Number),
            maxId: sql<number>`max(${schema.generalJournals.id})`.mapWith(Number),
        })
            .from(schema.generalJournals)
            .where(and(
                eq(schema.generalJournals.userId, userId),
                isNotNull(schema.generalJournals.lineDescription),
                ne(schema.generalJournals.lineDescription, ''),
                sql`${schema.generalJournals.lineDescription} ILIKE ${kw}`
            ))
            .groupBy(schema.generalJournals.lineDescription)
            .orderBy(sql`count(*) DESC`, sql`max(${schema.generalJournals.id}) DESC`)
            .limit(8);
        return rows.map(r => r.description!).filter(Boolean);
    }
}