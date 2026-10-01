using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace AumoBackend.Models;

public class TransactionCounter
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [StringLength(10)]
    public string CounterKey { get; set; } = string.Empty;

    public int LastSequence { get; set; }
}
