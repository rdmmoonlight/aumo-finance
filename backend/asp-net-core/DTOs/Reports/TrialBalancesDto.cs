// <copyright file="TrialBalancesDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using System;

namespace AumoBackend.DTOs.Reports;

/// <summary>
/// Mewakili Trial Balances Row.
/// </summary>
public class TrialBalancesRow
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Mewakili User Id.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Mewakili Period Id.
    /// </summary>
    public int PeriodId { get; set; }

    /// <summary>
    /// Mewakili Account Number.
    /// </summary>
    public string AccountNumber { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Account Name.
    /// </summary>
    public string AccountName { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Debit Balance.
    /// </summary>
    public decimal DebitBalance { get; set; }

    /// <summary>
    /// Mewakili Credit Balance.
    /// </summary>
    public decimal CreditBalance { get; set; }

    /// <summary>
    /// Mewakili Is Total Row.
    /// </summary>
    public bool IsTotalRow { get; set; }

    /// <summary>
    /// Mewakili Created At.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
