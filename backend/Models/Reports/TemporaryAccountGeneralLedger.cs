using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AumoBackend.Models;

[Table("temporary_account_general_ledgers")]
public class TemporaryAccountGeneralLedger
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("period_id")]
    public int PeriodId { get; set; }

    [Column("account_id")]
    public int AccountId { get; set; }

    [Column("journal_entry_id")]
    public int JournalEntryId { get; set; }

    [Column("journal_entry_line_id")]
    public int JournalEntryLineId { get; set; }

    [Column("entry_date")]
    public DateTime EntryDate { get; set; }

    [Column("transaction_number")]
    public string TransactionNumber { get; set; } = string.Empty;

    [Column("line_description")]
    public string? LineDescription { get; set; }

    [Column("debit", TypeName = "numeric(18,2)")]
    public decimal Debit { get; set; }

    [Column("credit", TypeName = "numeric(18,2)")]
    public decimal Credit { get; set; }

    [Column("running_balance", TypeName = "numeric(18,2)")]
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
