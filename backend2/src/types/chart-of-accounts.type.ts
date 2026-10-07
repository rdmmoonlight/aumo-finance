import { z } from 'zod';

// DTOs - migrasi dari AumoBackend.DTOs
export const createAccountRequestSchema = z.object({
    referenceNumber: z.number().int().min(1),
    accountName: z.string().min(1, 'Account name is required').trim(),
    type: z.string().min(1, 'Account category type is required'),
    role: z.string().optional()
});
export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;

export const updateAccountRequestSchema = z.object({
    referenceNumber: z.number().int().min(1),
    accountName: z.string().min(1, 'Account name is required').trim(),
    type: z.string().min(1, 'Account category type is required'),
    role: z.string().optional(),
    isActive: z.boolean().default(true)
});
export type UpdateAccountRequest = z.infer<typeof updateAccountRequestSchema>;

export interface AccountItem {
    id: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    role: string;
    isActive: boolean;
    balance: number;
}

export interface ChartOfAccountsListResponse {
    success: boolean;
    selectedPeriodName: string | null;
    accounts: AccountItem[];
}

export interface ServiceResult {
    isSuccess: boolean;
    message: string;
    accountId?: number;
    statusCode: number;
}

// Untuk route query params
export const getAccountsQuerySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional()
});
