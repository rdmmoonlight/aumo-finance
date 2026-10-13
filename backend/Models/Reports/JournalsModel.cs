using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AumoBackend.Models.Reports
{
    [Table("GeneralJournal")]
    public class GeneralJournal
    {
        // --- Detail / Line Properties ---

        [Key]
        [Column("LineId")]
        public int LineId { get; set; }

        [Required]
        [Column("AccountId")]
        public int AccountId { get; set; }

        [StringLength(250)]
        [Column("LineDescription")]
        public string? LineDescription { get; set; }

        [Required]
        [Column("Debit", TypeName = "numeric(18,2)")]
        public decimal Debit { get; set; }

        [Required]
        [Column("Credit", TypeName = "numeric(18,2)")]
        public decimal Credit { get; set; }

        [Required]
        [Column("LineOrder")]
        public int LineOrder { get; set; }

        // --- Header Properties ---

        [Required]
        [Column("JournalEntryId")]
        public int JournalEntryId { get; set; }

        [Required]
        [StringLength(50)]
        [Column("JournalType")]
        public string JournalType { get; set; } = string.Empty;

        [Required]
        [Column("EntryDate", TypeName = "timestamp with time zone")]
        public DateTime EntryDate { get; set; }

        [Required]
        [StringLength(30)]
        [Column("TransactionNumber")]
        public string TransactionNumber { get; set; } = string.Empty;

        [Required]
        [Column("UserId")]
        public Guid UserId { get; set; }

        [Column("Status")]
        public string? Status { get; set; }

        [Required]
        [Column("CreatedAt", TypeName = "timestamp with time zone")]
        public DateTime CreatedAt { get; set; }

        [Column("UpdatedAt", TypeName = "timestamp with time zone")]
        public DateTime? UpdatedAt { get; set; }
    }
}


