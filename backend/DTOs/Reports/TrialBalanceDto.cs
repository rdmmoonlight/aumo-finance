using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.DTOs;
namespace AumoBackend.DTOs.Reports;

public class TrialBalanceRow
{
    public int AccountId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Role { get; set; }
    public bool NormalBalanceIsDebit { get; set; }
    public decimal NetBalance { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}
