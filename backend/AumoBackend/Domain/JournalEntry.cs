namespace AumoBackend.Domain;

/// <summary>
/// Objek domain jurnal. Satu-satunya cara membuatnya adalah <see cref="Create"/>,
/// sehingga jurnal yang sudah terbentuk pasti memenuhi seluruh aturan di bawah.
/// </summary>
/// <remarks>
/// Aturan:
/// 1. Baris tanpa akun atau tanpa nominal diabaikan.
/// 2. Minimal dua baris bernilai.
/// 3. Nominal tidak negatif.
/// 4. Setiap baris hanya debit atau hanya kredit.
/// 5. Presisi seragam: paling banyak 2 desimal dan 16 digit sebelum koma (selaras dengan kolom DECIMAL(18,2)).
///    Nominal yang melebihi presisi DITOLAK, tidak dibulatkan secara diam-diam.
/// 6. Total debit sama dengan total kredit dan tidak nol.
/// Pelanggaran aturan dilaporkan lewat <see cref="DomainRuleViolation"/>.
/// </remarks>
public sealed class JournalEntry
{
    public const int MinimumLineCount = 2;
    public const int AmountScale = 2;
    public const int MaxIntegerDigits = 16;

    // 10^16: batas atas (tidak termasuk) untuk DECIMAL(18,2).
    private const decimal MaxAmountExclusive = 10_000_000_000_000_000m;

    private JournalEntry(IReadOnlyList<JournalLine> lines, decimal totalDebit, decimal totalCredit)
    {
        this.Lines = lines;
        this.TotalDebit = totalDebit;
        this.TotalCredit = totalCredit;
    }

    public IReadOnlyList<JournalLine> Lines { get; }

    public decimal TotalDebit { get; }

    public decimal TotalCredit { get; }

    public static JournalEntry Create(IEnumerable<JournalLine> lines)
    {
        ArgumentNullException.ThrowIfNull(lines);

        var effective = lines
            .Where(l => l is not null && l.IsEffective)
            .ToList();

        if (effective.Count < MinimumLineCount)
        {
            throw new DomainRuleViolation("A journal entry must have at least two line items.");
        }

        foreach (var line in effective)
        {
            EnsureLineIsValid(line);
        }

        decimal totalDebit = effective.Sum(l => l.Debit);
        decimal totalCredit = effective.Sum(l => l.Credit);

        if (totalDebit != totalCredit || totalDebit == 0)
        {
            throw new DomainRuleViolation("Total debit must equal total credit before posting.");
        }

        return new JournalEntry(effective.AsReadOnly(), totalDebit, totalCredit);
    }

    /// <summary>
    /// Nominal sah: tidak lebih dari 2 desimal dan kurang dari 10^16 (nilai mutlak).
    /// Angka nol di belakang koma tidak dihitung (1,10 dan 1,100 sama-sama sah).
    /// </summary>
    public static bool IsValidAmount(decimal amount)
        => Math.Abs(amount) < MaxAmountExclusive && Math.Round(amount, AmountScale) == amount;

    private static void EnsureLineIsValid(JournalLine line)
    {
        if (line.Debit < 0)
        {
            throw new DomainRuleViolation("Debit amount cannot be negative.");
        }

        if (line.Credit < 0)
        {
            throw new DomainRuleViolation("Credit amount cannot be negative.");
        }

        if (line.Debit > 0 && line.Credit > 0)
        {
            throw new DomainRuleViolation("A journal line cannot have both a debit and a credit amount.");
        }

        if (!IsValidAmount(line.Debit) || !IsValidAmount(line.Credit))
        {
            throw new DomainRuleViolation(
                "Amounts support at most 2 decimal places and 16 digits before the decimal point.");
        }
    }
}
