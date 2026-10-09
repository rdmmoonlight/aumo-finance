import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
// ISOLATED TOTAL: import * as schema from '../db/schema.js';
import {
    normalBalanceIsDebit,
    parseClassification,
    validateReferenceNumber
} from '../lib/account-classification.js';
// TEMP_DISABLED: import { db } from '../lib/db.js';
const db = {} as any;
import { AppError, BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type {
    AccountItem,
    ChartOfAccountsListResponse,
    CreateAccountRequest,
    ServiceResult,
    UpdateAccountRequest
} from '../types/chart-of-accounts.type.js';

export class ChartOfAccountsService {
    async getAccounts(
        userId: string,
        search?: string | null,
        category?: string | null
    ): Promise<ChartOfAccountsListResponse> {
        // Base query: WHERE userId = userId
        let whereConditions = [eq(schema.chartOfAccounts.userId, userId)];

        if (search && search.trim()) {
            const keyword = `%${search.trim().toLowerCase()}%`;
            // AccountName ILIKE keyword OR ReferenceNumber::text LIKE keyword
            whereConditions.push(
                or(
                    ilike(schema.chartOfAccounts.accountName, keyword),
                    sql`${schema.chartOfAccounts.referenceNumber}::text ILIKE ${keyword}`
                ) as any
            );
        }

        if (category && category.trim()) {
            whereConditions.push(eq(schema.chartOfAccounts.type, category.trim()));
        }

        const loadedAccounts = await db.query.chartOfAccounts.findMany({
            where: and(...whereConditions),
            orderBy: [asc(schema.chartOfAccounts.referenceNumber)]
        });

        const accountIds = loadedAccounts.map(a => a.id);

        // SelectedPeriodHelper.GetSelectedPeriodAsync -> di TS kita cek selected period dulu, fallback ke latest
        // Untuk sekarang: ambil period terbaru (sesuai C# fallback)
        let currentPeriod = await this.getSelectedPeriod(userId);

        if (!currentPeriod && loadedAccounts.length > 0) {
            currentPeriod = await db.query.periods.findFirst({
                where: eq(schema.periods.userId, userId),
                orderBy: [desc(schema.periods.startDate)]
            }) || null;
        }

        // Map untuk balance
        const balanceMap = new Map<number, { totalDebit: number; totalCredit: number }>();

        if (currentPeriod && accountIds.length > 0) {
            const startUtc = new Date(currentPeriod.startDate);
            startUtc.setHours(0, 0, 0, 0);
            const endUtc = new Date(currentPeriod.endDate);
            endUtc.setHours(23, 59, 59, 999);

            const balances = await db
                .select({
                    accountId: schema.journalEntryLines.accountId,
                    totalDebit: sql<number>`sum(${schema.journalEntryLines.debit})::float`.as('total_debit'),
                    totalCredit: sql<number>`sum(${schema.journalEntryLines.credit})::float`.as('total_credit')
                })
                .from(schema.journalEntryLines)
                .innerJoin(
                    schema.journalEntries,
                    eq(schema.journalEntryLines.journalEntryId, schema.journalEntries.id)
                )
                .where(
                    and(
                        inArray(schema.journalEntryLines.accountId, accountIds),
                        eq(schema.journalEntries.userId, userId),
                        inArray(schema.journalEntries.journalType, ['General', 'Adjusting']),
                        gte(schema.journalEntries.entryDate, startUtc),
                        lte(schema.journalEntries.entryDate, endUtc)
                    )
                )
                .groupBy(schema.journalEntryLines.accountId);

            for (const b of balances) {
                balanceMap.set(b.accountId, {
                    totalDebit: b.totalDebit || 0,
                    totalCredit: b.totalCredit || 0
                });
            }
        }

        const accountsList: AccountItem[] = loadedAccounts.map(account => {
            let balance = 0;
            const bal = balanceMap.get(account.id);

            if (bal) {
                const classification = parseClassification(account.type);
                if (classification) {
                    balance = normalBalanceIsDebit(classification)
                        ? bal.totalDebit - bal.totalCredit
                        : bal.totalCredit - bal.totalDebit;
                } else {
                    balance = bal.totalDebit - bal.totalCredit;
                }
            }

            return {
                id: account.id,
                referenceNumber: account.referenceNumber,
                accountName: account.accountName,
                type: account.type,
                role: account.role,
                isActive: account.isActive,
                balance
            };
        });

        return {
            success: true,
            selectedPeriodName: currentPeriod?.periodName || null,
            accounts: accountsList
        };
    }

    async createAccount(userId: string, request: CreateAccountRequest): Promise<ServiceResult> {
        if (!request.accountName?.trim()) {
            throw new BadRequestError('Account name is required.');
        }
        if (!request.type?.trim()) {
            throw new BadRequestError('Account category type is required.');
        }

        const classification = parseClassification(request.type);
        if (!classification) {
            throw new BadRequestError(`Invalid account classification category '${request.type}'.`);
        }

        // ValidateReferenceNumber - sekarang dengan referenceNumber
        if (!validateReferenceNumber(classification, request.referenceNumber)) {
            throw new BadRequestError(
                `Invalid reference number ${request.referenceNumber} for category ${request.type}.`
            );
        }

        const isCodeTaken = await db.query.chartOfAccounts.findFirst({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.referenceNumber, request.referenceNumber)
            )
        });

        if (isCodeTaken) {
            throw new ConflictError(`Account code ${request.referenceNumber} is already in use.`);
        }

        try {
            const [newAccount] = await db.insert(schema.chartOfAccounts).values({
                userId,
                referenceNumber: request.referenceNumber,
                accountName: request.accountName.trim(),
                type: request.type.trim(),
                role: request.role?.trim() || 'Default',
                isActive: true
            }).returning();

            logger.info({ userId, accountId: newAccount.id }, `Account '${newAccount.accountName}' created`);

            return {
                isSuccess: true,
                message: `Account '${newAccount.accountName}' successfully created.`,
                accountId: newAccount.id,
                statusCode: 200
            };
        } catch (err: any) {
            logger.error({ err, userId }, 'Failed to create account');
            throw new AppError(`A fatal error occurred while saving the account: ${err.message}`, 500);
        }
    }

    async updateAccount(
        userId: string,
        accountId: number,
        request: UpdateAccountRequest
    ): Promise<ServiceResult> {
        const account = await db.query.chartOfAccounts.findFirst({
            where: and(
                eq(schema.chartOfAccounts.id, accountId),
                eq(schema.chartOfAccounts.userId, userId)
            )
        });

        if (!account) {
            throw new NotFoundError('Account not found.');
        }

        if (!request.accountName?.trim()) {
            throw new BadRequestError('Account name is required.');
        }

        const classification = parseClassification(request.type);
        if (!classification) {
            throw new BadRequestError(`Invalid account classification category '${request.type}'.`);
        }

        if (!validateReferenceNumber(classification, request.referenceNumber)) {
            throw new BadRequestError(
                `Invalid reference number ${request.referenceNumber} for category ${request.type}.`
            );
        }

        const isCodeTaken = await db.query.chartOfAccounts.findFirst({
            where: and(
                eq(schema.chartOfAccounts.userId, userId),
                eq(schema.chartOfAccounts.referenceNumber, request.referenceNumber),
                sql`${schema.chartOfAccounts.id} != ${accountId}`
            )
        });

        if (isCodeTaken) {
            throw new ConflictError(`Account code ${request.referenceNumber} is already in use.`);
        }

        try {
            await db.update(schema.chartOfAccounts).set({
                referenceNumber: request.referenceNumber,
                accountName: request.accountName.trim(),
                type: request.type.trim(),
                role: request.role?.trim() || 'Default',
                isActive: request.isActive,
                updatedAt: new Date()
            }).where(eq(schema.chartOfAccounts.id, accountId));

            return {
                isSuccess: true,
                message: `Account '${request.accountName.trim()}' successfully updated.`,
                statusCode: 200
            };
        } catch (err: any) {
            throw new AppError(`A fatal error occurred while updating the account: ${err.message}`, 500);
        }
    }

    async deleteAccount(userId: string, accountId: number): Promise<ServiceResult> {
        const entity = await db.query.chartOfAccounts.findFirst({
            where: and(
                eq(schema.chartOfAccounts.id, accountId),
                eq(schema.chartOfAccounts.userId, userId)
            )
        });

        if (!entity) {
            throw new NotFoundError('Account not found.');
        }

        const hasJournalLines = await db.query.journalEntryLines.findFirst({
            where: eq(schema.journalEntryLines.accountId, accountId)
        });

        if (hasJournalLines) {
            throw new BadRequestError(
                `Account '${entity.accountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.`
            );
        }

        try {
            await db.delete(schema.chartOfAccounts).where(eq(schema.chartOfAccounts.id, accountId));

            return {
                isSuccess: true,
                message: `Account '${entity.accountName}' successfully deleted.`,
                statusCode: 200
            };
        } catch (err: any) {
            throw new AppError(`A fatal error occurred while deleting the account: ${err.message}`, 500);
        }
    }

    // Helper pengganti SelectedPeriodHelper
    private async getSelectedPeriod(userId: string) {
        // Coba ambil dari user settings / selected period
        // Jika tidak ada tabel user_settings, return null dan akan fallback ke latest period
        try {
            const userSetting = await db.query.userSettings?.findFirst?.({
                where: eq((schema as any).userSettings.userId, userId)
            } as any);

            if ((userSetting as any)?.selectedPeriodId) {
                return await db.query.periods.findFirst({
                    where: eq(schema.periods.id, (userSetting as any).selectedPeriodId)
                });
            }
        } catch { }
        return null;
    }
}

export const chartOfAccountsService = new ChartOfAccountsService();
