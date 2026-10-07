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
