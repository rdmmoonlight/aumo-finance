import { getApiV1Summary } from '@/lib/generated'

export type SummaryResponse = unknown

export async function getSummaryApi(signal?: AbortSignal) {
  const { data } = await getApiV1Summary({ signal, throwOnError: true })
  return data as SummaryResponse
}

export interface StatementOfFinancialPositionParams {
  isPostClosing?: boolean
}

export type TrialBalanceType = 'unadjusted' | 'adjusted' | 'post-closing'

export interface GetTrialBalanceParams {
  type?: TrialBalanceType
}

export const reportsKeys = {
  all: ['reports'] as const,
  summary: ['reports', 'summary'] as const,
  financialStatements: ['reports', 'financial-statements'] as const,
  incomeStatement: ['reports', 'financial-statements', 'income-statement'] as const,
  retainedEarnings: ['reports', 'financial-statements', 'retained-earnings'] as const,
  cashFlow: ['reports', 'financial-statements', 'cash-flow'] as const,
  financialPosition: (params?: StatementOfFinancialPositionParams) =>
    ['reports', 'financial-statements', 'financial-position', params ?? {}] as const,
  generalLedgers: ['reports', 'general-ledgers'] as const,
  generalLedgerPermanent: ['reports', 'general-ledgers', 'permanent'] as const,
  generalLedgerTemporary: ['reports', 'general-ledgers', 'temporary'] as const,
  journals: ['reports', 'journals'] as const,
  journalsGeneral: ['reports', 'journals', 'general'] as const,
  journalsAdjusting: ['reports', 'journals', 'adjusting'] as const,
  journalsClosing: ['reports', 'journals', 'closing'] as const,
  trialBalances: (params?: GetTrialBalanceParams) =>
    ['reports', 'trial-balances', params?.type ?? 'unadjusted'] as const,
  worksheet: ['reports', 'worksheet'] as const,
}
