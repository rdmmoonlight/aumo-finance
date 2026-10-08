import { z } from 'zod';

export interface TrialBalancesRow {
    id: number;
    accountId?: number;
    referenceNumber: string;
    accountName: string;
    type: string;
    role: string | null;
    normalBalanceIsDebit?: boolean;
    netBalance: number;
    debit: number;
    credit: number;
}

export type ReportType = 'unadjusted' | 'adjusted' | 'post-closing';

export const trialBalancesQuerySchema = z.object({
    periodId: z.number().int(),
    includeAdjusting: z.boolean().optional().default(false),
    reportType: z.enum(['unadjusted', 'adjusted', 'post-closing']).optional().default('unadjusted')
});
