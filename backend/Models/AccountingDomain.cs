using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.RegularExpressions;

namespace AumoBackend.Models;

public static class AccountClassification
{
    private static readonly HashSet<string> PermanentTypes = new()
    {
        "Assets", "Liabilities", "Equity"
    };

    private static readonly HashSet<string> TemporaryTypes = new()
    {
        "OperatingIncome", "OperatingExpenses", "OtherIncome", "OtherExpenses"
    };

    private static readonly HashSet<string> NormalDebitTypes = new()
    {
        "Assets", "OperatingExpenses", "OtherExpenses"
    };

    public static bool IsPermanent(string type) => PermanentTypes.Contains(type);

    public static bool IsTemporary(string type) => TemporaryTypes.Contains(type);

    public static bool NormalBalanceIsDebit(string type) => NormalDebitTypes.Contains(type);

    public static int ValidRangeStart(string type) => type switch
    {
        "Assets" => 100,
        "Liabilities" => 200,
        "Equity" => 300,
        "OperatingIncome" => 400,
        "OperatingExpenses" => 500,
        "OtherIncome" => 600,
        "OtherExpenses" => 800,
        _ => 0
    };

    public static int ValidRangeEnd(string type) => type switch
    {
        "Assets" => 199,
        "Liabilities" => 299,
        "Equity" => 399,
        "OperatingIncome" => 499,
        "OperatingExpenses" => 599,
        "OtherIncome" => 799,
        "OtherExpenses" => 999,
        _ => 0
    };

    public static bool ValidateReferenceNumber(string type, int referenceNumber)
    {
        var start = ValidRangeStart(type);
        var end = ValidRangeEnd(type);
        return start != 0 && referenceNumber >= start && referenceNumber <= end;
    }

    public static string? TypeFromReferenceNumber(int referenceNumber) => referenceNumber switch
    {
        >= 100 and <= 199 => "Assets",
        >= 200 and <= 299 => "Liabilities",
        >= 300 and <= 399 => "Equity",
        >= 400 and <= 499 => "OperatingIncome",
        >= 500 and <= 599 => "OperatingExpenses",
        >= 600 and <= 799 => "OtherIncome",
        >= 800 and <= 999 => "OtherExpenses",
        _ => null
    };
}

public class ChartOfAccount
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Reference number is required.")]
    public int ReferenceNumber { get; set; }

    public Guid UserId { get; set; }

    [Required(ErrorMessage = "Account name is required.")]
    [StringLength(100)]
    public string AccountName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Account type is required.")]
    public string Type { get; set; } = string.Empty;

    [Required(ErrorMessage = "System role is required.")]
    public string Role { get; set; } = string.Empty;

    [NotMapped]
    public decimal Balance { get; set; }

    public bool IsActive { get; set; } = true;

    [NotMapped]
    public string DisplayLabel => $"{ReferenceNumber} - {AccountName}";
}

public class JournalEntry
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(30)]
    public string TransactionNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string JournalType { get; set; } = "General";

    [Required]
    public DateTime EntryDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<JournalEntryLine> Lines { get; set; } = new();

    public decimal TotalDebit => Lines.Sum(l => l.Debit);
    public decimal TotalCredit => Lines.Sum(l => l.Credit);
}

public class JournalEntryLine
{
    public int Id { get; set; }

    [Required]
    public int JournalEntryId { get; set; }

    [ForeignKey(nameof(JournalEntryId))]
    public JournalEntry? JournalEntry { get; set; }

    [Required]
    public int AccountId { get; set; }

    [ForeignKey(nameof(AccountId))]
    public ChartOfAccount? Account { get; set; }

    [StringLength(250)]
    public string? LineDescription { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Debit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Credit { get; set; }

    public int LineOrder { get; set; }
}

public class Period
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(100)]
    public string PeriodName { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsClosed { get; set; }
    public bool IsSelected { get; set; }
}

public static class PeriodLock
{
    public static bool IsDateLocked(DateTime date, IEnumerable<Period> closedPeriods)
    {
        return closedPeriods.Any(p => date >= p.StartDate && date <= p.EndDate);
    }
}

public class TransactionCounter
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(10)]
    public string CounterKey { get; set; } = string.Empty;

    public int LastSequence { get; set; }
}

public static class TransactionNumberFormatter
{
    private static readonly Regex NewFormat = new(@"^([A-Z]+)(\d{4})(\d{4})$", RegexOptions.Compiled);

    public static string ToDisplay(string? raw)
    {
        if (string.IsNullOrEmpty(raw)) return raw ?? string.Empty;

        var match = NewFormat.Match(raw);
        if (!match.Success)
        {
            return raw;
        }

        return $"{match.Groups[1].Value}-{match.Groups[2].Value}-{match.Groups[3].Value}";
    }
}
