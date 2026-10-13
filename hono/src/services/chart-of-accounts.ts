// chart-of-accounts.service.ts
import { and, asc, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema/chart-of-accounts';
import { normalBalanceIsDebit, tryParseClassification, validateReferenceNumber } from '../lib/account-classification';

type DrizzleDb = NodePgDatabase<typeof schema>;

// DTOs
export type AccountItemDto = {
    id: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    role: string;
    isActive: boolean;
    balance: number;
}
export type ChartOfAccountsListResponseDto = {
    success: boolean;
    selectedPeriodName?: string | null;
    accounts: AccountItemDto[];
}
export type CreateAccountRequestDto = {
    referenceNumber: number;
    accountName: string;
    type: string;
    role?: string;
}
export type UpdateAccountRequestDto = CreateAccountRequestDto & { isActive: boolean };
export type ServiceResultDto = {
    isSuccess: boolean;
    message: string;
    accountId?: number;
    statusCode: number;
}

export class ChartOfAccountsService {
    constructor(private db: DrizzleDb) { }

    async getAccounts(userId: string, search?: string, category?: string): Promise<ChartOfAccountsListResponseDto> {
        const conditions = [eq(schema.chartOfAccounts.userId, userId)];

        if (search?.trim()) {
            const kw = `%${search.trim()}%`;
            conditions.push(
                sql`(${schema.chartOfAccounts.accountName} ILIKE ${kw} OR CAST(${schema.chartOfAccounts.referenceNumber} AS TEXT) ILIKE ${kw})`
            );
        }
        if (category?.trim()) {
            conditions.push(eq(schema.chartOfAccounts.type, category.trim()));
        }

        const loadedAccounts = await this.db
            .select()
            .from(schema.chartOfAccounts)
            .where(and(...conditions))
            .orderBy(asc(schema.chartOfAccounts.referenceNumber));

        if (loadedAccounts.length === 0) {
            const currentPeriod = await this.getCurrentPeriod(userId);
            return { success: true, selectedPeriodName: currentPeriod?.periodName ?? null, accounts: [] };
        }

        const accountIds = loadedAccounts.map(a => a.id);
        const currentPeriod = await this.getCurrentPeriod(userId);

        const balanceMap = new Map<number, { debit: number; credit: number }>();

        if (currentPeriod) {
            const startUtc = new Date(Date.UTC(
                currentPeriod.startDate.getUTCFullYear(),
                currentPeriod.startDate.getUTCMonth(),
                currentPeriod.startDate.getUTCDate(), 0, 0, 0, 0
            ));
            const endUtc = new Date(Date.UTC(
                currentPeriod.endDate.getUTCFullYear(),
                currentPeriod.endDate.getUTCMonth(),
                currentPeriod.endDate.getUTCDate(), 23, 59, 59, 999
            ));

            const rows = await this.db
                .select({
                    accountId: schema.journalEntryLines.accountId,
                    totalDebit: sql<number>`SUM(${schema.journalEntryLines.debit}::decimal)`.mapWith(Number),
                    totalCredit: sql<number>`SUM(${schema.journalEntryLines.credit}::decimal)`.mapWith(Number),
                })
                .from(schema.journalEntryLines)
                .innerJoin(schema.journalEntries, eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id))
                .where(and(
                    inArray(schema.journalEntryLines.accountId, accountIds),
                    eq(schema.journalEntries.userId, userId),
                    inArray(schema.journalEntries.journalType, ['General', 'Adjusting']),
                    gte(schema.journalEntries.entryDate, startUtc),
                    lte(schema.journalEntries.entryDate, endUtc)
                ))
                .groupBy(schema.journalEntryLines.accountId);

            for (const r of rows) balanceMap.set(r.accountId, { debit: r.totalDebit ?? 0, credit: r.totalCredit ?? 0 });
        }

        const accounts: AccountItemDto[] = loadedAccounts.map(acc => {
            const bal = balanceMap.get(acc.id);
            let balance = 0;
            if (bal) {
                const classification = tryParseClassification(acc.type);
                if (classification) {
                    balance = normalBalanceIsDebit(classification)
                        ? bal.debit - bal.credit
                        : bal.credit - bal.debit;
                } else {
                    balance = bal.debit - bal.credit;
                }
            }
            return {
                id: acc.id,
                referenceNumber: acc.referenceNumber,
                accountName: acc.accountName,
                type: acc.type,
                role: acc.role,
                isActive: acc.isActive,
                balance,
            };
        });

        return {
            success: true,
            selectedPeriodName: currentPeriod?.periodName ?? null,
            accounts,
        };
    }

    async createAccount(userId: string, req: CreateAccountRequestDto): Promise<ServiceResultDto> {
        if (!req.accountName?.trim()) return this.fail('Account name is required.', 400);
        if (!req.type?.trim()) return this.fail('Account category type is required.', 400);

        const classification = tryParseClassification(req.type);
        if (!classification) return this.fail(`Invalid account classification category '${req.type}'.`, 400);
        if (!validateReferenceNumber(classification)) return this.fail(`Invalid reference number ${req.referenceNumber} for category ${req.type}.`, 400);

        const exists = await this.db.query.chartOfAccounts.findFirst({
            where: and(eq(schema.chartOfAccounts.userId, userId), eq(schema.chartOfAccounts.referenceNumber, req.referenceNumber)),
        });
        if (exists) return this.fail(`Account code ${req.referenceNumber} is already in use.`, 400);

        try {
            const [newAcc] = await this.db.insert(schema.chartOfAccounts).values({
                id: sql<number>`DEFAULT`,
                userId,
                referenceNumber: req.referenceNumber,
                accountName: req.accountName.trim(),
                type: req.type,
                role: req.role?.trim() ? req.role : 'Default',
                isActive: true,
            }).returning();

            return { isSuccess: true, message: `Account '${newAcc.accountName}' successfully created.`, accountId: newAcc.id, statusCode: 200 };
        } catch (e: any) {
            return this.fail(`A fatal error occurred while saving the account: ${e.message}`, 500);
        }
    }

    async updateAccount(userId: string, accountId: number, req: UpdateAccountRequestDto): Promise<ServiceResultDto> {
        const account = await this.db.query.chartOfAccounts.findFirst({
            where: and(eq(schema.chartOfAccounts.id, accountId), eq(schema.chartOfAccounts.userId, userId)),
        });
        if (!account) return this.fail('Account not found.', 404);
        if (!req.accountName?.trim()) return this.fail('Account name is required.', 400);

        const classification = tryParseClassification(req.type);
        if (!classification) return this.fail(`Invalid account classification category '${req.type}'.`, 400);
        if (!validateReferenceNumber(classification)) return this.fail(`Invalid reference number ${req.referenceNumber} for category ${req.type}.`, 400);

        const codeTaken = await this.db.query.chartOfAccounts.findFirst({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.referenceNumber, req.referenceNumber),
                ne(schema.chartOfAccounts.id, accountId)
            ),
        });
        if (codeTaken) return this.fail(`Account code ${req.referenceNumber} is already in use.`, 400);

        try {
            await this.db.update(schema.chartOfAccounts).set({
                referenceNumber: req.referenceNumber,
                accountName: req.accountName.trim(),
                type: req.type,
                role: req.role?.trim() ? req.role : 'Default',
                isActive: req.isActive,
            }).where(eq(schema.chartOfAccounts.id, accountId));

            return this.success(`Account '${req.accountName.trim()}' successfully updated.`);
        } catch (e: any) {
            return this.fail(`A fatal error occurred while updating the account: ${e.message}`, 500);
        }
    }

    async deleteAccount(userId: string, accountId: number): Promise<ServiceResultDto> {
        const entity = await this.db.query.chartOfAccounts.findFirst({
            where: and(eq(schema.chartOfAccounts.id, accountId), eq(schema.chartOfAccounts.userId, userId)),
        });
        if (!entity) return this.fail('Account not found.', 404);

        const hasJournal = await this.db.query.journalEntryLines.findFirst({
            where: eq(schema.journalEntryLines.accountId, accountId),
        });
        if (hasJournal) {
            return this.fail(`Account '${entity.accountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.`, 400);
        }

        try {
            await this.db.delete(schema.chartOfAccounts).where(eq(schema.chartOfAccounts.id, accountId));
            return this.success(`Account '${entity.accountName}' successfully deleted.`);
        } catch (e: any) {
            return this.fail(`A fatal error occurred while deleting the account: ${e.message}`, 500);
        }
    }

    private async getCurrentPeriod(userId: string) {
        // SelectedPeriodHelper.GetSelectedPeriodAsync equivalent
        const selected = await this.db.query.selectedPeriods.findFirst({
            where: eq(schema.selectedPeriods.userId, userId),
        });
        if (selected) {
            const period = await this.db.query.periods.findFirst({ where: eq(schema.periods.id, selected.periodId) });
            if (period) return period;
        }
        // fallback: latest period
        return await this.db.query.periods.findFirst({
            where: eq(schema.periods.userId, userId),
            orderBy: desc(schema.periods.startDate),
        });
    }

    private success(msg: string): ServiceResultDto { return { isSuccess: true, message: msg, statusCode: 200 }; }
    private fail(msg: string, code: number): ServiceResultDto { return { isSuccess: false, message: msg, statusCode: code }; }
}