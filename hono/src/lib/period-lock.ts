export enum AccountClassification { Asset, Liability, Equity, Revenue, Expense }

normalBalanceIsDebitByClassification() // Asset & Expense = true
isTemporaryByClassification() // Revenue & Expense = temporary
normalBalanceIsDebitByType(type) // Assets/OperatingExpenses/OtherExpenses = debit

resolveClassification('OperatingIncome') => Revenue
isDateLocked(date, periods) // cek IsClosed && date di dalam range