using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.DTOs;
using AumoBackend.Models;
namespace AumoBackend.DTOs.Reports;

public class ClosingJournalEntryGroupApiResponse
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ClosingJournalLineApiResponse> Lines { get; set; } = new();
    public decimal TotalDebit => Lines.Sum(l => l.Debit);
    public decimal TotalCredit => Lines.Sum(l => l.Credit);
}

public class ClosingJournalLineApiResponse
{
    public string ReferenceNumber { get; set; } = "0";
    public string AccountName { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}
