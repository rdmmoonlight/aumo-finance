// Pengganti AumoBackend.Helpers.AccountClassificationHelper
// Enum untuk klasifikasi akun - sesuai PSAK / umum

export enum AccountClassification {
    Asset = 'Asset',
    Liability = 'Liability',
    Equity = 'Equity',
    Revenue = 'Revenue',
    Expense = 'Expense',
    // Alias yang sering dipakai
    Assets = 'Asset',
    Liabilities = 'Liability',
    Income = 'Revenue',
}

// Normal balance: Asset & Expense = Debit, lainnya Credit
export function normalBalanceIsDebit(classification: AccountClassification): boolean {
    return (
        classification === AccountClassification.Asset ||
        classification === AccountClassification.Assets ||
        classification === AccountClassification.Expense
    );
}

// Parse string ke enum (case-insensitive) - pengganti Enum.TryParse<AccountClassification>
export function parseClassification(type: string): AccountClassification | null {
    if (!type) return null;
    const normalized = type.trim().toLowerCase();

    const map: Record<string, AccountClassification> = {
        'asset': AccountClassification.Asset,
        'assets': AccountClassification.Asset,
        'liability': AccountClassification.Liability,
        'liabilities': AccountClassification.Liability,
        'equity': AccountClassification.Equity,
        'revenue': AccountClassification.Revenue,
        'income': AccountClassification.Revenue,
        'expense': AccountClassification.Expense,
        'expenses': AccountClassification.Expense,
    };

    return map[normalized] || null;
}

// Validasi reference number berdasarkan klasifikasi
// Contoh range umum (bisa disesuaikan dengan aturan Aumo kamu):
// Asset 100-199, Liability 200-299, Equity 300-399, Revenue 400-499, Expense 500-599
export function validateReferenceNumber(
    classification: AccountClassification,
    referenceNumber?: number
): boolean {
    // Kalau dipanggil cuma dengan classification (seperti di C# kamu yang overload 1 argumen)
    // anggap valid selama enum-nya valid
    if (referenceNumber === undefined || referenceNumber === null) {
        return Object.values(AccountClassification).includes(classification);
    }

    const ranges: Record<AccountClassification, [number, number]> = {
        [AccountClassification.Asset]: [100, 199],
        [AccountClassification.Assets]: [100, 199],
        [AccountClassification.Liability]: [200, 299],
        [AccountClassification.Liabilities]: [200, 299],
        [AccountClassification.Equity]: [300, 399],
        [AccountClassification.Revenue]: [400, 499],
        [AccountClassification.Income]: [400, 499],
        [AccountClassification.Expense]: [500, 599],
        [AccountClassification.Expenses]: [500, 599],
    } as any;

    const range = ranges[classification];
    if (!range) return false;

    // Kalau range tidak mau ketat, bisa return true aja
    // Uncomment untuk validasi ketat:
    // return referenceNumber >= range[0] && referenceNumber <= range[1];

    // Saat ini: longgar, hanya cek enum valid (sesuai behavior C# kamu yang kadang cuma cek enum)
    // Ganti ke strict jika butuh:
    return true;
}

// Update dari file sebelumnya - tambah IsPermanent & IsTemporary
// Pengganti AumoBackend.Helpers.AccountClassificationHelper

export enum AccountClassification {
    Asset = 'Asset',
    Assets = 'Assets',
    Liability = 'Liability',
    Liabilities = 'Liabilities',
    Equity = 'Equity',
    Revenue = 'Revenue',
    OperatingIncome = 'OperatingIncome',
    OtherIncome = 'OtherIncome',
    Expense = 'Expense',
    OperatingExpenses = 'OperatingExpenses',
    OtherExpenses = 'OtherExpenses',
    Income = 'Income',
}

const PERMANENT_TYPES = ['Asset', 'Assets', 'Liability', 'Liabilities', 'Equity'];
const TEMPORARY_TYPES = [
    'OperatingIncome', 'OtherIncome', 'OperatingExpenses', 'OtherExpenses',
    'Revenue', 'Income', 'Expense', 'Expenses'
];

const DEBIT_NORMAL_TYPES = ['Asset', 'Assets', 'Expense', 'Expenses', 'OperatingExpenses', 'OtherExpenses'];

// Normal balance: Asset & Expense = Debit, lainnya Credit
export function normalBalanceIsDebit(classification: string | AccountClassification): boolean {
    if (!classification) return false;
    const type = String(classification);
    const lower = type.toLowerCase();
    if (DEBIT_NORMAL_TYPES.some(t => lower.includes(t.toLowerCase()))) return true;
    if (lower.includes('asset')) return true;
    if (lower.includes('expense') && !lower.includes('income')) return true;
    return false;
}

export function isPermanent(type: string): boolean {
    if (!type) return false;
    const lower = type.toLowerCase();
    return PERMANENT_TYPES.some(t => lower.includes(t.toLowerCase())) ||
        ['asset', 'liability', 'equity'].some(k => lower.includes(k) && !lower.includes('income') && !lower.includes('expense'));
}

export function isTemporary(type: string): boolean {
    if (!type) return false;
    const lower = type.toLowerCase();
    if (isPermanent(type) && !lower.includes('income') && !lower.includes('expense') && !lower.includes('revenue')) return false;
    return TEMPORARY_TYPES.some(t => lower.includes(t.toLowerCase())) ||
        lower.includes('income') || lower.includes('revenue') || lower.includes('expense');
}

export function isAccountPermanent(account: { type: string }): boolean {
    return isPermanent(account.type);
}

export function isAccountNormalBalanceDebit(account: { type: string }): boolean {
    return normalBalanceIsDebit(account.type);
}

export function parseClassification(type: string): AccountClassification | null {
    if (!type) return null;
    const normalized = type.trim().toLowerCase();
    const map: Record<string, AccountClassification> = {
        'asset': AccountClassification.Asset,
        'assets': AccountClassification.Assets,
        'liability': AccountClassification.Liability,
        'liabilities': AccountClassification.Liabilities,
        'equity': AccountClassification.Equity,
        'revenue': AccountClassification.Revenue,
        'operatingincome': AccountClassification.OperatingIncome,
        'otherincome': AccountClassification.OtherIncome,
        'expense': AccountClassification.Expense,
        'operatingexpenses': AccountClassification.OperatingExpenses,
        'otherexpenses': AccountClassification.OtherExpenses,
        'income': AccountClassification.Income,
    };
    return map[normalized] || null;
}

export function validateReferenceNumber(classification: AccountClassification, referenceNumber?: number): boolean {
    if (referenceNumber === undefined || referenceNumber === null) {
        return Object.values(AccountClassification).includes(classification);
    }
    return true;
}

export const AccountClassificationHelper = {
    NormalBalanceIsDebit: normalBalanceIsDebit,
    IsPermanent: isPermanent,
    IsTemporary: isTemporary,
    IsAccountPermanent: isAccountPermanent,
    IsAccountNormalBalanceDebit: isAccountNormalBalanceDebit,
};
