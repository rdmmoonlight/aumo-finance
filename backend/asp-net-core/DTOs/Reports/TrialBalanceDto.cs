// <copyright file="TrialBalanceDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs.Reports;

using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Mewakili Trial Balance Row.
/// </summary>

public class TrialBalanceRow
{
    /// <summary>
    /// Mewakili Account Id.
    /// </summary>
    public int AccountId { get; set; }
/// <summary>
/// Mewakili Reference Number.
/// </summary>

    public string ReferenceNumber { get; set; } = string.Empty;
/// <summary>
/// Mewakili Account Name.
/// </summary>

    public string AccountName { get; set; } = string.Empty;
/// <summary>
/// Mewakili Type.
/// </summary>

    public string Type { get; set; } = string.Empty;
/// <summary>
/// Mewakili Role.
/// </summary>

    public string? Role { get; set; }
/// <summary>
/// Mewakili Normal Balance Is Debit.
/// </summary>

    public bool NormalBalanceIsDebit { get; set; }
/// <summary>
/// Mewakili Net Balance.
/// </summary>

    public decimal NetBalance { get; set; }
/// <summary>
/// Mewakili Debit.
/// </summary>

    public decimal Debit { get; set; }
/// <summary>
/// Mewakili Credit.
/// </summary>

    public decimal Credit { get; set; }
}
