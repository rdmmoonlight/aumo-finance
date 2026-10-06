using System.ComponentModel.DataAnnotations;

namespace AumoBackend.Models.Reports;

public class TransactionCounter
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(10)]
    public string CounterKey { get; set; } = string.Empty;

    public int LastSequence { get; set; }
}

