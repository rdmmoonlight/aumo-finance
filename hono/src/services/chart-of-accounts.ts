import { and, asc, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as chartOfAccountsSchema from '../db/schema/chart-of-accounts';
import * as generalJournalSchema from '../db/schema/general-journal';
import * as periodSchema from '../db/schema/periods';
import { normalBalanceIsDebit, tryParseClassification, validateReferenceNumber } from '../lib/account-classification';

type DrizzleDb = NodePgDatabase<
    typeof chartOfAccountsSchema & typeof periodSchema & typeof generalJournalSchema
>;

// DTOs
export type AccountItemDto = {
    id: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    role: string;
    isActive: boolean;
    balance: number;
};

export type ChartOfAccountsListResponseDto = {
    success: boolean;
    selectedPeriodName?: string | null;
    accounts: AccountItemDto[];
};

export type CreateAccountRequestDto = {
    referenceNumber: number;
    accountName: string;
    type: string;
    role?: string;
};

export type UpdateAccountRequestDto = CreateAccountRequestDto & { isActive: boolean };

export type ServiceResultDto = {
    isSuccess: boolean;
    message: string;
    accountId?: number;
    statusCode: number;
};

export class ChartOfAccountsService {
    constructor(private db: DrizzleDb) { }

    async getAccounts(userId: string, search?: string, category?: string): Promise<ChartOfAccountsListResponseDto> {
        const conditions = [eq(chartOfAccountsSchema.chartOfAccounts.userId, userId)];

        if (search?.trim()) {
            const kw = `%${search.trim()}%`;
            conditions.push(
                sql`(${chartOfAccountsSchema.chartOfAccounts.accountName} ILIKE ${kw} OR CAST(${chartOfAccountsSchema.chartOfAccounts.referenceNumber} AS TEXT) ILIKE ${kw})`
            );
        }
        if (category?.trim()) {
            conditions.push(eq(chartOfAccountsSchema.chartOfAccounts.type, category.trim()));
        }

        const loadedAccounts = await this.db
            .select()
            .from(chartOfAccountsSchema.chartOfAccounts)
            .where(and(...conditions))
            .orderBy(asc(chartOfAccountsSchema.chartOfAccounts.referenceNumber));

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
                    accountId: generalJournalSchema.generalJournal.accountId,
                    totalDebit: sql<number>`SUM(${generalJournalSchema.generalJournal.debit}::decimal)`.mapWith(Number),
                    totalCredit: sql<number>`SUM(${generalJournalSchema.generalJournal.credit}::decimal)`.mapWith(Number),
                })
                .from(generalJournalSchema.generalJournal)
                .where(and(
                    inArray(generalJournalSchema.generalJournal.accountId, accountIds),
                    eq(generalJournalSchema.generalJournal.userId, userId),
                    inArray(generalJournalSchema.generalJournal.journalType, ['General', 'Adjusting']),
                    gte(generalJournalSchema.generalJournal.entryDate, startUtc.toISOString()),
                    lte(generalJournalSchema.generalJournal.entryDate, endUtc.toISOString())
                ))
                .groupBy(generalJournalSchema.generalJournal.accountId);

            for (const r of rows) {
                if (r.accountId !== null) {
                    balanceMap.set(r.accountId, { debit: r.totalDebit ?? 0, credit: r.totalCredit ?? 0 });
                }
            }
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
            where: and(eq(chartOfAccountsSchema.chartOfAccounts.userId, userId), eq(chartOfAccountsSchema.chartOfAccounts.referenceNumber, req.referenceNumber)),
        });
        if (exists) return this.fail(`Account code ${req.referenceNumber} is already in use.`, 400);

        try {
            const [newAcc] = await this.db.insert(chartOfAccountsSchema.chartOfAccounts).values({
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
            where: and(eq(chartOfAccountsSchema.chartOfAccounts.id, accountId), eq(chartOfAccountsSchema.chartOfAccounts.userId, userId)),
        });
        if (!account) return this.fail('Account not found.', 404);
        if (!req.accountName?.trim()) return this.fail('Account name is required.', 400);

        const classification = tryParseClassification(req.type);
        if (!classification) return this.fail(`Invalid account classification category '${req.type}'.`, 400);
        if (!validateReferenceNumber(classification)) return this.fail(`Invalid reference number ${req.referenceNumber} for category ${req.type}.`, 400);

        const codeTaken = await this.db.query.chartOfAccounts.findFirst({
            where: and(
                eq(chartOfAccountsSchema.chartOfAccounts.userId, userId),
                eq(chartOfAccountsSchema.chartOfAccounts.referenceNumber, req.referenceNumber),
                ne(chartOfAccountsSchema.chartOfAccounts.id, accountId)
            ),
        });
        if (codeTaken) return this.fail(`Account code ${req.referenceNumber} is already in use.`, 400);

        try {
            await this.db.update(chartOfAccountsSchema.chartOfAccounts).set({
                referenceNumber: req.referenceNumber,
                accountName: req.accountName.trim(),
                type: req.type,
                role: req.role?.trim() ? req.role : 'Default',
                isActive: req.isActive,
            }).where(eq(chartOfAccountsSchema.chartOfAccounts.id, accountId));

            return this.success(`Account '${req.accountName.trim()}' successfully updated.`);
        } catch (e: any) {
            return this.fail(`A fatal error occurred while updating the account: ${e.message}`, 500);
        }
    }

    async deleteAccount(userId: string, accountId: number): Promise<ServiceResultDto> {
        const entity = await this.db.query.chartOfAccounts.findFirst({
            where: and(eq(chartOfAccountsSchema.chartOfAccounts.id, accountId), eq(chartOfAccountsSchema.chartOfAccounts.userId, userId)),
        });
        if (!entity) return this.fail('Account not found.', 404);

        const hasJournal = await this.db.query.generalJournal.findFirst({
            where: eq(generalJournalSchema.generalJournal.accountId, accountId),
        });
        if (hasJournal) {
            return this.fail(`Account '${entity.accountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.`, 400);
        }

        try {
            await this.db.delete(chartOfAccountsSchema.chartOfAccounts).where(eq(chartOfAccountsSchema.chartOfAccounts.id, accountId));
            return this.success(`Account '${entity.accountName}' successfully deleted.`);
        } catch (e: any) {
            return this.fail(`A fatal error occurred while deleting the account: ${e.message}`, 500);
        }
    }

    private async getCurrentPeriod(userId: string) {
        const selected = await this.db.query.selectedPeriods.findFirst({
            where: eq(periodSchema.selectedPeriods.userId, userId),
        });
        if (selected) {
            const period = await this.db.query.periods.findFirst({ where: eq(periodSchema.periods.id, selected.periodId) });
            if (period) return period;
        }
        return await this.db.query.periods.findFirst({
            where: eq(periodSchema.periods.userId, userId),
            orderBy: desc(periodSchema.periods.startDate),
        });
    }

    private success(msg: string): ServiceResultDto { return { isSuccess: true, message: msg, statusCode: 200 }; }
    private fail(msg: string, code: number): ServiceResultDto { return { isSuccess: false, message: msg, statusCode: code }; }
}