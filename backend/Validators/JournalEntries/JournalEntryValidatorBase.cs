using System.Linq.Expressions;
using AumoBackend.DTOs;
using FluentValidation;

namespace AumoBackend.Validators.JournalEntries;

/// <summary>
/// Aturan skema bersama untuk request Create dan Edit jurnal.
/// Aturan yang butuh database (akun aktif, periode tertutup) tetap di controller.
/// </summary>
public abstract class JournalEntryValidatorBase<T> : AbstractValidator<T>
{
    // Selaras TransactionNumberService: "Adjusting" => AJ, selain itu GJ.
    public static readonly string[] AllowedJournalTypes = { "General", "Adjusting" };

    private const int MaxLines = 200;
    private static readonly DateTime MinEntryDate = new(2000, 1, 1);
    private static readonly DateTime MaxEntryDate = new(2100, 12, 31);

    protected JournalEntryValidatorBase(
        Expression<Func<T, DateTime>> entryDate,
        Expression<Func<T, string>> journalType,
        Expression<Func<T, IEnumerable<JournalEntryLineDto>>> lines)
    {
        var getLines = lines.Compile();

        RuleFor(entryDate)
            .Must(d => d >= MinEntryDate && d <= MaxEntryDate)
            .WithMessage("Entry date is invalid.");

        // Kosong diperbolehkan (Create => General, Edit => jenis jurnal semula).
        RuleFor(journalType)
            .Must(t => string.IsNullOrWhiteSpace(t) || AllowedJournalTypes.Contains(t))
            .WithMessage("Journal type must be 'General' or 'Adjusting'.");

        RuleFor(lines)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("Journal lines are required.")
            .Must(l => l.Count() <= MaxLines).WithMessage($"A journal entry cannot have more than {MaxLines} lines.")
            .Must(l => Effective(l).Count() >= 2).WithMessage("A journal entry must have at least two line items.")
            .Must(HaveBalancedTotals).WithMessage("Total debit must equal total credit before posting.");

        RuleForEach(lines)
            .Where(IsEffective)
            .SetValidator(new JournalLineDtoValidator())
            .When(x => getLines(x) != null);
    }

    private static bool IsEffective(JournalEntryLineDto line)
        => line != null && line.AccountId != 0 && (line.Debit != 0 || line.Credit != 0);

    private static IEnumerable<JournalEntryLineDto> Effective(IEnumerable<JournalEntryLineDto> lines)
        => lines.Where(IsEffective);

    private static bool HaveBalancedTotals(IEnumerable<JournalEntryLineDto> lines)
    {
        var effective = Effective(lines).ToList();
        var totalDebit = effective.Sum(l => l.Debit);
        var totalCredit = effective.Sum(l => l.Credit);
        return totalDebit == totalCredit && totalDebit > 0;
    }
}
