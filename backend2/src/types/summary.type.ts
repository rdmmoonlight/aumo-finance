import { z } from 'zod';

export interface Summary {
    selectedPeriodId: string | null;
    totalJournal: number;
    activeCoa: number;
    activePeriodName: string;
    isPeriodOpen: boolean;
    // Extra fields untuk frontend
    selectedPeriod?: {
        id: string;
        periodName: string;
        startDate: Date;
        endDate: Date;
        isClosed: boolean;
    } | null;
}

export const summarySchema = z.object({
    selectedPeriodId: z.string().nullable(),
    totalJournal: z.number(),
    activeCoa: z.number(),
    activePeriodName: z.string(),
    isPeriodOpen: z.boolean()
});
