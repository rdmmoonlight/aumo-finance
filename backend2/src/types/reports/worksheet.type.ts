import { z } from 'zod';

export interface WorksheetRow {
    accountId: number;
    referenceNumber: number;
    accountName: string;
    type: string;
    normalBalanceIsDebit: boolean;

    // Trial Balance - Unadjusted
    unadjustedDebit: number;
    unadjustedCredit: number;

    // Adjustments
    adjustmentDebit: number;
    adjustmentCredit: number;

    // Trial Balance - Adjusted
    adjustedDebit: number;
    adjustedCredit: number;

    // Income Statement columns (temporary accounts)
    incomeStatementDebit?: number;
    incomeStatementCredit?: number;

    // Financial Position columns (permanent accounts)
    financialPositionDebit?: number;
    financialPositionCredit?: number;
}

export const worksheetQuerySchema = z.object({
    periodId: z.number().int()
});
