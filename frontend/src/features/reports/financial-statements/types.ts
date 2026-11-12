// --- Common / Shared Types ---
export interface FinancialPeriod {
  id: string
  startDate: string
  endDate: string
  status: 'OPEN' | 'CLOSED'
}

// --- Income Statement (Laporan Laba Rugi) ---
export interface IncomeStatementItem {
  accountCode: string
  accountName: string
  amount: number
}

export interface IncomeStatementSection {
  title: string
  items: IncomeStatementItem[]
  subtotal: number
}

export interface IncomeStatementData {
  period: FinancialPeriod
  revenue: IncomeStatementSection
  costOfGoodsSold: IncomeStatementSection
  grossProfit: number
  operatingExpenses: IncomeStatementSection
  operatingIncome: number
  otherIncomeExpense: IncomeStatementSection
  netIncomeBeforeTax: number
  taxExpense: number
  netIncome: number
}

// --- Retained Earnings (Laporan Laba Ditahan) ---
export interface RetainedEarningsData {
  period: FinancialPeriod
  beginningBalance: number
  netIncome: number
  dividendsPaid: number
  otherAdjustments: number
  endingBalance: number
}

// --- Statement of Cash Flow (Laporan Arus Kas) ---
export interface CashFlowItem {
  description: string
  amount: number
}

export interface CashFlowSection {
  title: string
  items: CashFlowItem[]
  subtotal: number
}

export interface CashFlowData {
  period: FinancialPeriod
  operatingActivities: CashFlowSection
  investingActivities: CashFlowSection
  financingActivities: CashFlowSection
  netChangeInCash: number
  beginningCashBalance: number
  endingCashBalance: number
}

// --- Statement of Financial Position / Balance Sheet (Laporan Posisi Keuangan) ---
export interface BalanceSheetItem {
  accountCode: string
  accountName: string
  amount: number
}

export interface BalanceSheetSection {
  title: string
  items: BalanceSheetItem[]
  subtotal: number
}

export interface BalanceSheetCategory {
  title: string
  sections: BalanceSheetSection[]
  total: number
}

export interface FinancialPositionData {
  period: FinancialPeriod
  assets: {
    currentAssets: BalanceSheetSection
    nonCurrentAssets: BalanceSheetSection
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: BalanceSheetSection
    nonCurrentLiabilities: BalanceSheetSection
    totalLiabilities: number
  }
  equity: {
    section: BalanceSheetSection
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
}
