export type TrialBalanceType = "unadjusted" | "adjusted" | "post-closing";

export interface LedgerParams {
  periodId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PeriodConfigPayload {
  name: string;
  startDate: string;
  endDate: string;
  cashAccountId: string;
  bankAccountId: string;
  retainedEarningsAccountId: string;
}
