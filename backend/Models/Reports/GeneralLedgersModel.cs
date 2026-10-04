using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AumoBackend.Models;

/// <summary>
/// General ledger records for permanent accounts.
/// Permanent accounts are carried forward from one accounting period
/// to the next, such as assets, liabilities, and equity.
/// </summary>
[Table("PermanentAccountsGeneralLedger")]
public class PermanentAccountsGeneralLedger
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public int PeriodId { get; set; }

    public int AccountId { get; set; }

    public int JournalEntryId { get; set; }

    public int JournalEntryLineId { get; set; }

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public string? LineDescription { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal Debit { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal Credit { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal RunningBalance { get; set; }

    // Navigation Properties

    [ForeignKey(nameof(PeriodId))]
    public virtual Period? Period { get; set; }

    [ForeignKey(nameof(AccountId))]
    public virtual ChartOfAccount? Account { get; set; }

    [ForeignKey(nameof(JournalEntryId))]
    public virtual JournalEntry? JournalEntry { get; set; }

    [ForeignKey(nameof(JournalEntryLineId))]
    public virtual JournalEntryLine? JournalEntryLine { get; set; }
}

/// <summary>
/// General ledger records for temporary accounts.
/// Temporary accounts are closed at the end of an accounting period,
/// such as revenue and expense accounts.
/// </summary>
[Table("TemporaryAccountsGeneralLedger")]
public class TemporaryAccountsGeneralLedger
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public int PeriodId { get; set; }

    public int AccountId { get; set; }

    public int JournalEntryId { get; set; }

    public int JournalEntryLineId { get; set; }

    public DateTime EntryDate { get; set; }

    public string TransactionNumber { get; set; } = string.Empty;

    public string? LineDescription { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal Debit { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal Credit { get; set; }

    [Column(TypeName = "numeric(18,2)")]
    public decimal RunningBalance { get; set; }

    // Navigation Properties

    [ForeignKey(nameof(PeriodId))]
    public virtual Period? Period { get; set; }

    [ForeignKey(nameof(AccountId))]
    public virtual ChartOfAccount? Account { get; set; }

    [ForeignKey(nameof(JournalEntryId))]
    public virtual JournalEntry? JournalEntry { get; set; }

    [ForeignKey(nameof(JournalEntryLineId))]
    public virtual JournalEntryLine? JournalEntryLine { get; set; }
}
