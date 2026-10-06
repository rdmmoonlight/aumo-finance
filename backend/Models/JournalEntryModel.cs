using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace AumoBackend.Models;

public class JournalEntry
{
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [StringLength(30)]
    public string TransactionNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string JournalType { get; set; } = "General"; // misal: General, Sales, Purchase, Payment

    [Required]
    public DateTime EntryDate { get; set; }

    [StringLength(500)]
    public string? Description { get; set; } // Deskripsi/Keterangan Header Jurnal

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Posted"; // Draft, Posted, Void

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation Property
    public List<JournalEntryLine> Lines { get; set; } = new();

    // Property kalkulasi (tidak disimpan ke database)
    [NotMapped]
    public decimal TotalDebit => Lines?.Sum(l => l.Debit) ?? 0m;

    [NotMapped]
    public decimal TotalCredit => Lines?.Sum(l => l.Credit) ?? 0m;

    [NotMapped]
    public bool IsBalanced => TotalDebit == TotalCredit;
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
    public decimal Debit { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Credit { get; set; } = 0m;

    public int LineOrder { get; set; }
}