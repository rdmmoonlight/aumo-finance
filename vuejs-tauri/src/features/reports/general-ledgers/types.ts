export type AccountNormalBalance = 'DEBIT' | 'CREDIT'

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'

export interface LedgerEntryItem {
  id: string
  date: string
  referenceNumber: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface LedgerAccountGroup {
  accountId: string
  accountCode: string
  accountName: string
  category: AccountCategory
  normalBalance: AccountNormalBalance
  beginningBalance: number
  endingBalance: number
  totalDebit: number
  totalCredit: number
  entries: LedgerEntryItem[]
}

export interface GeneralLedgerSummary {
  totalRevenue?: number
  totalExpense?: number
  netIncome?: number
}

export interface GeneralLedgerResponse {
  periodId: string
  periodName: string
  startDate: string
  endDate: string
  isClosed: boolean
  accounts: LedgerAccountGroup[]
  summary?: GeneralLedgerSummary
}
