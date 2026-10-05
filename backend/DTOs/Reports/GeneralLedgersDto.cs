using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.DTOs;
using AumoBackend.Models;
namespace AumoBackend.DTOs.Reports;

public class LedgerAccountResponse
{
    public int AccountId { get; set; }
    public int ReferenceNumber { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool NormalBalanceIsDebit { get; set; }
    public decimal BeginningBalance { get; set; }
    public decimal EndingBalance { get; set; }
    public List<LedgerLineResponse> Lines { get; set; } = new();
}

public class LedgerLineResponse
{
    public int JournalEntryId { get; set; }
    public string TransactionNumber { get; set; } = string.Empty;
    public string EntryDate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class PermanentLedgerDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public int AccountReferenceNumber { get; set; }
    public int JournalEntryId { get; set; }
    public int JournalEntryLineId { get; set; }
    public DateTime EntryDate { get; set; }
    public string TransactionNumber { get; set; } = string.Empty;
    public string LineDescription { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class TemporaryLedgerDto : PermanentLedgerDto
{
    public string AccountType { get; set; } = string.Empty;
}
