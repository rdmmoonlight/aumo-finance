using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using AumoBackend.Models;

namespace AumoBackend.Models;

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
