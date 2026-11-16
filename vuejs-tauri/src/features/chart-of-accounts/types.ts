// Tipe dan nilai di bawah ini mengikuti kontrak backend (ChartOfAccountsDto.cs
// dan AccountClassificationHelper di ChartOfAccountsModel.cs).

export type AccountType =
  | 'Assets'
  | 'Liabilities'
  | 'Equity'
  | 'OperatingIncome'
  | 'OperatingExpenses'
  | 'OtherIncome'
  | 'OtherExpenses'

export type AccountRole = 'Default' | 'CashAndEquivalents' | 'RetainedEarnings'

export interface AccountTypeOption {
  value: AccountType
  label: string
  /** Rentang nomor referensi yang valid di backend (inklusif). */
  range: readonly [number, number]
}

export const ACCOUNT_TYPE_OPTIONS: readonly AccountTypeOption[] = [
  { value: 'Assets', label: 'Aset (Assets)', range: [100, 199] },
  { value: 'Liabilities', label: 'Liabilitas (Liabilities)', range: [200, 299] },
  { value: 'Equity', label: 'Ekuitas (Equity)', range: [300, 399] },
  { value: 'OperatingIncome', label: 'Pendapatan Usaha (Operating Income)', range: [400, 499] },
  { value: 'OperatingExpenses', label: 'Beban Usaha (Operating Expenses)', range: [500, 599] },
  { value: 'OtherIncome', label: 'Pendapatan Lain (Other Income)', range: [600, 799] },
  { value: 'OtherExpenses', label: 'Beban Lain (Other Expenses)', range: [800, 999] },
]

export const ACCOUNT_ROLE_OPTIONS: readonly { value: AccountRole; label: string }[] = [
  { value: 'Default', label: 'Umum (Default)' },
  { value: 'CashAndEquivalents', label: 'Kas dan Setara Kas' },
  { value: 'RetainedEarnings', label: 'Laba Ditahan' },
]

export function getAccountTypeLabel(type: string): string {
  return ACCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export function getAccountRoleLabel(role: string): string {
  return ACCOUNT_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
}

/** Satu baris akun, sesuai AccountItemDto. */
export interface Account {
  id: number
  referenceNumber: number
  accountName: string
  type: AccountType | string
  role: AccountRole | string
  isActive: boolean
  balance: number
}

/** Bentuk respons GET /api/v1/chart-of-accounts, sesuai ChartOfAccountsListResponseDto. */
export interface ChartOfAccountsList {
  success: boolean
  selectedPeriodName: string | null
  accounts: Account[]
}

/** Nilai yang dikirim oleh form dialog. */
export interface AccountFormValues {
  referenceNumber: number
  accountName: string
  type: AccountType
  role: AccountRole
  isActive: boolean
}
