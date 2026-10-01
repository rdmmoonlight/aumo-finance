using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Collections.Generic;
using AumoBackend.DTOs;

namespace AumoBackend.ViewModels;

public class PreviewJournalImportViewModel
{
    public List<JournalTransactionDto> Transactions { get; set; } = new();
    public List<AccountMappingDetailDto> AccountMappings { get; set; } = new();
    public PreviewJournalSummaryViewModel Summary { get; set; } = new();
}

public class PreviewJournalSummaryViewModel
{
    public int TotalUniqueAccounts { get; set; }
    public int ExactMatchCount { get; set; }
    public int ReallocatedCount { get; set; }
    public int UnmappedCount { get; set; }
    public bool IsPerfectMatch { get; set; }
}

public class ImportJournalResultViewModel
{
    public string Message { get; set; } = string.Empty;
    public int ImportedEntriesCount { get; set; }
}
