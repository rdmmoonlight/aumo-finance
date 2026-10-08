// ==========================================
// Converted from C# AccountClassification + Helper + PeriodLock
// Target: src/lib/account-classification.ts & src/lib/period-lock.ts
// ==========================================

// --- 1. Enum Klasifikasi (C# enum AccountClassification) ---
export enum AccountClassification {
    Asset = 'Asset',
    Liability = 'Liability',
    Equity = 'Equity',
    Revenue = 'Revenue',
    Expense = 'Expense',
}

// Mapping dari C# Type string -> Classification
export type AccountTypeString =
    | 'Assets'
    | 'Liabilities'
    | 'Equity'
    | 'OperatingIncome'
    | 'OtherIncome'
    | 'OperatingExpenses'
    | 'OtherExpenses';

// --- 2. Extension Methods (C# AccountClassificationExtensions) ---

export function normalBalanceIsDebitByClassification(
    classification: AccountClassification
): boolean {
    return (
        classification === AccountClassification.Asset ||
        classification === AccountClassification.Expense
    );
}

export function isTemporaryByClassification(
    classification: AccountClassification
): boolean {
    return (
        classification === AccountClassification.Revenue ||
        classification === AccountClassification.Expense
    );
}

export function isPermanentByClassification(
    classification: AccountClassification
): boolean {
    return !isTemporaryByClassification(classification);
}

// --- 3. Helper (C# AccountClassificationHelper) ---

export function normalBalanceIsDebitByType(
    accountType?: string | null
): boolean {
    switch (accountType) {
        case 'Assets':
        case 'OperatingExpenses':
        case 'OtherExpenses':
            return true; // Debit normal
        case 'Liabilities':
        case 'Equity':
        case 'OperatingIncome':
        case 'OtherIncome':
            return false; // Kredit normal
        default:
            return true; // fallback C# _ => true
    }
}

export function isTemporaryByType(type?: string | null): boolean {
    if (!type) return false;
    return (
        type === 'OperatingIncome' ||
        type === 'OtherIncome' ||
        type === 'OperatingExpenses' ||
        type === 'OtherExpenses' ||
        type === 'Revenue' ||
        type === 'Expense'
    );
}

export function isPermanentByType(type?: string | null): boolean {
    return !isTemporaryByType(type);
}

export function validateReferenceNumber(refNum?: string | null): boolean {
    if (!refNum || refNum.trim() === '') return false;
    return !isNaN(Number(refNum)) && Number.isInteger(Number(refNum));
}

export function validateReferenceNumberByValue(referenceNumber: number): boolean {
    return Number.isInteger(referenceNumber) && referenceNumber > 0;
}

// --- 4. Classification Resolver ---

export function resolveClassification(
    type: string
): AccountClassification {
    switch (type) {
        case 'Assets':
            return AccountClassification.Asset;
        case 'Liabilities':
            return AccountClassification.Liability;
        case 'Equity':
            return AccountClassification.Equity;
        case 'OperatingIncome':
        case 'OtherIncome':
            return AccountClassification.Revenue;
        case 'OperatingExpenses':
        case 'OtherExpenses':
            return AccountClassification.Expense;
        default:
            // fallback, anggap Expense jika tidak dikenali biar balance tetap jalan
            return AccountClassification.Expense;
    }
}

// ==========================================
// PeriodLock - Converted from C# PeriodLock
// ==========================================

export interface Period {
    id: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
    name?: string | null;
}

export function isPeriodLocked(period?: Period | null): boolean {
    return period?.isClosed ?? false;
}

export function isPeriodLockedByFlag(isClosed: boolean): boolean {
    return isClosed;
}

export function isDateLocked(date: Date, periods?: Period[] | null): boolean {
    if (!periods || periods.length === 0) return false;

    for (const period of periods) {
        if (period.isClosed && date >= period.startDate && date <= period.endDate) {
            return true;
        }
    }
    return false;
}
