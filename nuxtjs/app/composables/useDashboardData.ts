import type { Period } from '~/types'

// Shape returned by GET /api/v1/dashboard?period=monthly|annual
// (backend/Controllers/DashboardController.cs). Only the fields the
// Home page actually renders are typed here — the backend response
// has more fields than this (cumulative totals, per-tab breakdowns)
// that aren't used yet.
export interface DashboardAccountBalance {
  accountId: string
  referenceNumber: number
  accountName: string
  balance: number
}

export interface DashboardTrendPoint {
  label: string
  revenue: number
  expense: number
  net: number
}

export interface DashboardData {
  success: boolean
  hasPeriodSelected: boolean
  selectedPeriodName: string
  isPeriodClosed: boolean

  totalAssets: number
  totalCashOnHand: number
  totalBankBalance: number
  totalLiabilities: number
  totalEquity: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number

  expenseAccountsList: DashboardAccountBalance[]
  chartTrend: DashboardTrendPoint[]
}

export function useDashboardData(period: Ref<Period>) {
  return useFetch<DashboardData>('/api/v1/dashboard', {
    query: { period },
    watch: [period]
  })
}
