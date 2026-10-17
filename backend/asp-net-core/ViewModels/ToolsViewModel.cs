// <copyright file="ToolsViewModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.ViewModels;

using System.Collections.Generic;
using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Model data Preview Journal Import View Model.
/// </summary>

public class PreviewJournalImportViewModel
{
    /// <summary>
    /// Mewakili Transactions.
    /// </summary>
    public List<JournalTransactionDto> Transactions { get; set; } = new();
/// <summary>
/// Mewakili Account Mappings.
/// </summary>

    public List<AccountMappingDetailDto> AccountMappings { get; set; } = new();
/// <summary>
/// Mewakili Summary.
/// </summary>

    public PreviewJournalSummaryViewModel Summary { get; set; } = new();
}
/// <summary>
/// Model data Preview Journal Summary View Model.
/// </summary>

public class PreviewJournalSummaryViewModel
{
    /// <summary>
    /// Mewakili Total Unique Accounts.
    /// </summary>
    public int TotalUniqueAccounts { get; set; }
/// <summary>
/// Mewakili Exact Match Count.
/// </summary>

    public int ExactMatchCount { get; set; }
/// <summary>
/// Mewakili Reallocated Count.
/// </summary>

    public int ReallocatedCount { get; set; }
/// <summary>
/// Mewakili Unmapped Count.
/// </summary>

    public int UnmappedCount { get; set; }
/// <summary>
/// Mewakili Is Perfect Match.
/// </summary>

    public bool IsPerfectMatch { get; set; }
}
/// <summary>
/// Model data Import Journal Result View Model.
/// </summary>

public class ImportJournalResultViewModel
{
    /// <summary>
    /// Mewakili Message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
/// <summary>
/// Mewakili Imported Entries Count.
/// </summary>

    public int ImportedEntriesCount { get; set; }
}