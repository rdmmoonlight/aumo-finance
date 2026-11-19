namespace AumoBackend.Domain;

/// <summary>
/// Sumber tunggal aturan jenis akun: tujuh kategori, pembagian akun permanen/sementara,
/// saldo normal, dan rentang nomor akun. Tidak mengenal EF Core, ASP.NET, maupun DTO.
/// </summary>
/// <remarks>
/// Semua metode di sini bersifat ketat: hanya tujuh nama kanonik (huruf besar/kecil dibedakan) yang dikenal.
/// Nama lama yang longgar (mis. "Asset", "Revenue", "Expenses") dipetakan lewat <see cref="Normalize"/>
/// sebelum diperiksa, sehingga perilaku buku besar tidak berubah.
/// </remarks>
public static class AccountType
{
    public const string Assets = "Assets";
    public const string Liabilities = "Liabilities";
    public const string Equity = "Equity";
    public const string OperatingIncome = "OperatingIncome";
    public const string OperatingExpenses = "OperatingExpenses";
    public const string OtherIncome = "OtherIncome";
    public const string OtherExpenses = "OtherExpenses";

    /// <summary>Tujuh kategori akun, berurutan menurut rentang nomor akun.</summary>
    public static IReadOnlyList<string> All { get; } = new[]
    {
        Assets, Liabilities, Equity, OperatingIncome, OperatingExpenses, OtherIncome, OtherExpenses,
    };

    /// <summary>Akun posisi keuangan; saldonya dibawa ke periode berikutnya.</summary>
    public static IReadOnlyList<string> PermanentTypes { get; } = new[] { Assets, Liabilities, Equity };

    /// <summary>Akun laba rugi (pendapatan dan beban); ditutup ke Laba Ditahan saat closing.</summary>
    public static IReadOnlyList<string> TemporaryTypes { get; } = new[]
    {
        OperatingIncome, OtherIncome, OperatingExpenses, OtherExpenses,
    };

    private static readonly Dictionary<string, (int Start, int End)> ReferenceRanges = new()
    {
        [Assets] = (100, 199),
        [Liabilities] = (200, 299),
        [Equity] = (300, 399),
        [OperatingIncome] = (400, 499),
        [OperatingExpenses] = (500, 599),
        [OtherIncome] = (600, 799),
        [OtherExpenses] = (800, 999),
    };

    public static bool IsKnown(string? type) => type is not null && ReferenceRanges.ContainsKey(type);

    public static bool IsPermanent(string? type) => type is not null && PermanentTypes.Contains(type);

    public static bool IsTemporary(string? type) => type is not null && TemporaryTypes.Contains(type);

    /// <summary>Pendapatan: OperatingIncome dan OtherIncome (saldo normal kredit).</summary>
    public static bool IsRevenue(string? type) => type is OperatingIncome or OtherIncome;

    /// <summary>Beban: OperatingExpenses dan OtherExpenses (saldo normal debit).</summary>
    public static bool IsExpense(string? type) => type is OperatingExpenses or OtherExpenses;

    /// <summary>
    /// Saldo normal debit: Assets, OperatingExpenses, OtherExpenses.
    /// Saldo normal kredit: Liabilities, Equity, OperatingIncome, OtherIncome.
    /// Jenis tidak dikenal (atau null) dianggap bukan debit normal.
    /// </summary>
    public static bool IsDebitNormal(string? type) => type is Assets || IsExpense(type);

    public static bool TryGetReferenceRange(string? type, out int start, out int end)
    {
        if (type is not null && ReferenceRanges.TryGetValue(type, out var range))
        {
            (start, end) = range;
            return true;
        }

        start = 0;
        end = 0;
        return false;
    }

    public static bool IsReferenceNumberValid(string? type, int referenceNumber)
        => TryGetReferenceRange(type, out var start, out var end)
            && referenceNumber >= start
            && referenceNumber <= end;

    /// <summary>
    /// Memetakan nama kanonik (tanpa membedakan huruf besar/kecil) dan nama lama
    /// ("Asset", "Liability", "Income", "Revenue", "Expense", "Expenses") ke salah satu dari tujuh nama kanonik.
    /// Mengembalikan null bila tidak dikenal.
    /// </summary>
    public static string? Normalize(string? type)
    {
        if (string.IsNullOrEmpty(type))
        {
            return null;
        }

        foreach (var canonical in All)
        {
            if (canonical.Equals(type, StringComparison.OrdinalIgnoreCase))
            {
                return canonical;
            }
        }

        return type.ToLowerInvariant() switch
        {
            "asset" => Assets,
            "liability" => Liabilities,
            "income" or "revenue" => OperatingIncome,
            "expense" or "expenses" => OperatingExpenses,
            _ => null,
        };
    }
}
