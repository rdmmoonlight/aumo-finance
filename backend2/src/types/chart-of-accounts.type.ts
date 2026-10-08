import { z } from 'zod';
import { AccountClassification } from '../lib/account-classification';

// ==========================================
// 1. Core Schemas
// ==========================================

export const accountItemSchema = z.object({
    id: z.number().int(),
    referenceNumber: z.number().int().min(1, 'Reference number wajib diisi'),
    accountName: z.string().min(1, 'Account name wajib diisi').trim().max(100),
    type: z.string().min(1, 'Account type wajib diisi'), // Assets, Liabilities, dll
    role: z.string().default(''),
    isActive: z.boolean().default(true),
    balance: z.number().default(0), // computed, bukan dari DB
    displayLabel: z.string().optional(), // computed `${ref} - ${name}`
    classification: z.nativeEnum(AccountClassification).optional(),
});
export type AccountItem = z.infer<typeof accountItemSchema>;
export type AccountItemDto = AccountItem;

export const accountDtoSchema = z.object({
    id: z.number().int(),
    referenceNumber: z.number().int(),
    accountName: z.string(),
    type: z.string(),
    role: z.string().default(''),
    isActive: z.boolean().optional(),
    balance: z.number().optional(),
    displayLabel: z.string().optional(),
});
export type AccountDto = z.infer<typeof accountDtoSchema>;

// ==========================================
// 2. List Response (dari C# ChartOfAccountsListResponseDto)
// ==========================================

export const chartOfAccountsListResponseSchema = z.object({
    success: z.boolean().default(true),
    selectedPeriodName: z.string().nullable().optional(),
    accounts: z.array(accountItemSchema).default([]),
    totalAssets: z.number().optional(),
    totalLiabilities: z.number().optional(),
    totalEquity: z.number().optional(),
});
export type ChartOfAccountsListResponse = z.infer<typeof chartOfAccountsListResponseSchema>;
export type ChartOfAccountsListResponseDto = ChartOfAccountsListResponse;

// ==========================================
// 3. Create Request
// ==========================================

export const createAccountRequestSchema = z.object({
    referenceNumber: z.coerce.number().int().min(1, 'Reference number wajib diisi'),
    accountName: z.string().min(1, 'Account name is required').trim().max(100),
    type: z.string().min(1, 'Account category type is required'), // validasi: Assets, Liabilities, Equity, OperatingIncome, OtherIncome, OperatingExpenses, OtherExpenses
    role: z.string().nullable().optional().default(''),
});
export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;
export type CreateAccountRequestDto = CreateAccountRequest;

// ==========================================
// 4. Update Request
// ==========================================

export const updateAccountRequestSchema = z.object({
    referenceNumber: z.coerce.number().int().min(1, 'Reference number wajib diisi'),
    accountName: z.string().min(1, 'Account name is required').trim().max(100),
    type: z.string().min(1, 'Account category type is required'),
    role: z.string().nullable().optional().default(''),
    isActive: z.boolean().default(true),
});
export type UpdateAccountRequest = z.infer<typeof updateAccountRequestSchema>;
export type UpdateAccountRequestDto = UpdateAccountRequest;

// ==========================================
// 5. Service Result (pengganti C# ServiceResultDto)
// ==========================================

export const serviceResultSchema = z.object({
    isSuccess: z.boolean(),
    message: z.string().default(''),
    accountId: z.number().int().nullable().optional(),
    statusCode: z.number().int().default(200),
});
export type ServiceResult = z.infer<typeof serviceResultSchema>;
export type ServiceResultDto = ServiceResult;

// ==========================================
// 6. Query Params
// ==========================================

export const getAccountsQuerySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(), // filter by type/classification
    isActive: z.coerce.boolean().optional(),
    type: z.string().optional(),
});
export type GetAccountsQuery = z.infer<typeof getAccountsQuerySchema>;

// ==========================================
// 7. Helper type untuk balance calculation
// ==========================================

export interface AccountBalance {
    accountId: number;
    debit: number;
    credit: number;
    balance: number; // sesuai normal balance
    displayLabel: string;
}
