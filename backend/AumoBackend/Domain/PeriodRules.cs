namespace AumoBackend.Domain;

using System.Globalization;

/// <summary>Nilai periode yang dibutuhkan aturan domain; tidak bergantung pada entitas EF Core.</summary>
public sealed record PeriodRange(int Id, string Name, DateTime StartDate, DateTime EndDate, bool IsClosed);

/// <summary>
/// Aturan penutupan dan pembukaan periode akuntansi.
/// </summary>
/// <remarks>
/// 1. Periode yang sudah ditutup tidak dapat ditutup lagi.
/// 2. Periode hanya dapat ditutup bila tidak ada periode yang lebih awal yang masih terbuka.
/// 3. Periode baru hanya dapat dibuka bila periode sebelumnya (jika ada) sudah ditutup.
/// 4. Neraca saldo periode (setelah penyesuaian) wajib seimbang: total debit sama dengan total kredit.
/// 5. Laba atau rugi bersih tidak nol hanya dapat ditutup bila ada akun Retained Earnings aktif yang menampungnya.
/// 6. Jurnal penutup dibuat saat periode ditutup: setiap kelompoknya wajib seimbang, dan neraca saldo pasca-penutupan juga wajib seimbang.
/// Pelanggaran dilaporkan lewat <see cref="DomainRuleViolation"/>.
/// </remarks>
public static class PeriodRules
{
    /// <summary>Ada periode lain milik pemilik yang sama, lebih awal, dan belum ditutup.</summary>
    public static bool HasEarlierOpenPeriod(PeriodRange period, IEnumerable<PeriodRange> allPeriods)
    {
        ArgumentNullException.ThrowIfNull(period);
        ArgumentNullException.ThrowIfNull(allPeriods);

        return allPeriods.Any(p => p.Id != period.Id && p.StartDate < period.StartDate && !p.IsClosed);
    }

    /// <summary>Memeriksa aturan 1 dan 2; melempar bila periode tidak boleh ditutup.</summary>
    public static void EnsureCanClose(PeriodRange period, IEnumerable<PeriodRange> allPeriods)
    {
        ArgumentNullException.ThrowIfNull(period);

        if (period.IsClosed)
        {
            throw new DomainRuleViolation($"Period {period.Name} is already closed.");
        }

        if (HasEarlierOpenPeriod(period, allPeriods))
        {
            throw new DomainRuleViolation(
                $"Cannot close {period.Name}: an earlier period is still open. Close earlier periods first.");
        }
    }

    /// <summary>Memeriksa aturan 3; <paramref name="previous"/> null berarti ini periode pertama.</summary>
    public static void EnsurePreviousClosed(PeriodRange? previous, string newPeriodName)
    {
        if (previous is { IsClosed: false })
        {
            throw new DomainRuleViolation($"Period {previous.Name} must be closed before opening {newPeriodName}.");
        }
    }

    /// <summary>
    /// Memeriksa aturan 4 dan bagian akhir aturan 6: total debit harus sama dengan total kredit (dibulatkan 2 desimal).
    /// <paramref name="stage"/> hanya mengubah kata dalam pesan ("trial balance" atau "post-closing trial balance").
    /// </summary>
    public static void EnsureTrialBalanceBalanced(string periodName, decimal totalDebit, decimal totalCredit, string stage = "trial balance")
    {
        if (Math.Round(totalDebit, 2) != Math.Round(totalCredit, 2))
        {
            throw new DomainRuleViolation(
                $"Cannot close {periodName}: the {stage} is not balanced "
                + $"(debit {Format(totalDebit)} vs credit {Format(totalCredit)}). Check the journals of this period.");
        }
    }

    /// <summary>Laba bersih = total saldo akun pendapatan dikurangi total saldo akun beban (saldo sudah menurut sisi normalnya).</summary>
    public static decimal NetIncome(IEnumerable<(string? Type, decimal NetBalance)> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);

        decimal revenue = rows.Where(r => AccountType.IsRevenue(r.Type)).Sum(r => r.NetBalance);
        decimal expense = rows.Where(r => AccountType.IsExpense(r.Type)).Sum(r => r.NetBalance);
        return revenue - expense;
    }

    /// <summary>Memeriksa aturan 5.</summary>
    public static void EnsureCanReceiveNetIncome(string periodName, decimal netIncome, bool hasRetainedEarningsAccount)
    {
        if (Math.Round(netIncome, 2) != 0m && !hasRetainedEarningsAccount)
        {
            throw new DomainRuleViolation(
                $"Cannot close {periodName}: the period has a net income or loss of {Format(netIncome)} "
                + "but there is no active Retained Earnings account to receive it.");
        }
    }

    /// <summary>Memeriksa aturan 6 untuk satu kelompok jurnal penutup.</summary>
    public static void EnsureClosingGroupBalanced(string periodName, string description, decimal totalDebit, decimal totalCredit)
    {
        if (Math.Round(totalDebit, 2) != Math.Round(totalCredit, 2))
        {
            throw new DomainRuleViolation(
                $"Cannot close {periodName}: the closing journal \"{description}\" is not balanced "
                + $"(debit {Format(totalDebit)} vs credit {Format(totalCredit)}).");
        }
    }

    private static string Format(decimal value) => value.ToString("N2", CultureInfo.InvariantCulture);
}
