// <copyright file="ToolsDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs;

using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Model data Market Data Response.
/// </summary>

public class MarketDataResponse
{
    /// <summary>
    /// Mewakili Success.
    /// </summary>
    public bool Success { get; set; }
/// <summary>
/// Mewakili Usd.
/// </summary>

    public MarketDetail? Usd { get; set; }
/// <summary>
/// Mewakili Ihsg.
/// </summary>

    public MarketDetail? Ihsg { get; set; }
/// <summary>
/// Mewakili Bi Rate.
/// </summary>

    public string? BiRate { get; set; }
}
/// <summary>
/// Mewakili Market Detail.
/// </summary>

public class MarketDetail
{
    /// <summary>
    /// Mewakili Price.
    /// </summary>
    public double Price { get; set; }
/// <summary>
/// Mewakili Percent.
/// </summary>

    public double Percent { get; set; }
/// <summary>
/// Mewakili Is Up.
/// </summary>

    public bool IsUp { get; set; }
}
/// <summary>
/// Model data Journal Import Request Dto.
/// </summary>

public class JournalImportRequestDto
{
    /// <summary>
    /// Mewakili Target Year.
    /// </summary>
    public int TargetYear { get; set; }
/// <summary>
/// Mewakili Target Month.
/// </summary>

    public int TargetMonth { get; set; }
/// <summary>
/// Mewakili Transactions.
/// </summary>

    public List<JournalTransactionDto> Transactions { get; set; } = new();
/// <summary>
/// Mewakili Custom Mappings.
/// </summary>

    public List<AccountMappingDetailDto>? CustomMappings { get; set; }
}
/// <summary>
/// Model data Journal Transaction Dto.
/// </summary>

public class JournalTransactionDto
{
    /// <summary>
    /// Mewakili Transaction Number.
    /// </summary>
    public string TransactionNumber { get; set; } = string.Empty;
/// <summary>
/// Mewakili Date.
/// </summary>

    public string Date { get; set; } = string.Empty;
/// <summary>
/// Mewakili Journal Type.
/// </summary>

    public string JournalType { get; set; } = string.Empty;
/// <summary>
/// Mewakili Lines.
/// </summary>

    public List<JournalLineDto> Lines { get; set; } = new();
}
/// <summary>
/// Model data Journal Line Dto.
/// </summary>

public class JournalLineDto
{
    /// <summary>
    /// Mewakili Ref Number.
    /// </summary>
    public int RefNumber { get; set; }
/// <summary>
/// Mewakili Account Name.
/// </summary>

    public string AccountName { get; set; } = string.Empty;
/// <summary>
/// Mewakili Description.
/// </summary>

    public string Description { get; set; } = string.Empty;
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal? Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal? Credit { get; set; }
}
/// <summary>
/// Model data Account Mapping Detail Dto.
/// </summary>

public class AccountMappingDetailDto
{
    /// <summary>
    /// Mewakili Excel Ref.
    /// </summary>
    public int ExcelRef { get; set; }
/// <summary>
/// Mewakili Excel Account Name.
/// </summary>

    public string ExcelAccountName { get; set; } = string.Empty;
/// <summary>
/// Mewakili Mapped Ref.
/// </summary>

    public int MappedRef { get; set; }
/// <summary>
/// Mewakili Mapped Account Name.
/// </summary>

    public string MappedAccountName { get; set; } = string.Empty;
/// <summary>
/// Mewakili Status.
/// </summary>

    public string Status { get; set; } = string.Empty;
/// <summary>
/// Mewakili Reason.
/// </summary>

    public string Reason { get; set; } = string.Empty;
}
