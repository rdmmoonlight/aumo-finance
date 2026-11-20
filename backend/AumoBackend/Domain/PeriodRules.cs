namespace AumoBackend.Domain;

/// <summary>Nilai periode yang dibutuhkan aturan domain; tidak bergantung pada entitas EF Core.</summary>
public sealed record PeriodRange(int Id, string Name, DateTime StartDate, DateTime EndDate, bool IsClosed);

/// <summary>
/// Aturan penutupan dan pembukaan periode akuntansi.
/// </summary>
/// <remarks>
/// 1. Periode yang sudah ditutup tidak dapat ditutup lagi.
/// 2. Periode hanya dapat ditutup bila tidak ada periode yang lebih awal yang masih terbuka.
/// 3. Periode baru hanya dapat dibuka bila periode sebelumnya (jika ada) sudah ditutup.
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
}
