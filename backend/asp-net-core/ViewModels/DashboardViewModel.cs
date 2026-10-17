// <copyright file="DashboardViewModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.ViewModels;

using System;
using System.Collections.Generic;
using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
using AumoBackend.ViewModels;
/// <summary>
/// Model data Dashboard View Model.
/// </summary>

public class DashboardViewModel
{
    /// <summary>
    /// Mewakili User Id.
    /// </summary>
    public Guid UserId { get; set; }
    /// <summary>
    /// Mewakili Has Selected Period.
    /// </summary>

    public bool HasSelectedPeriod { get; set; }
    /// <summary>
    /// Mewakili Is Selected Period Closed.
    /// </summary>

    public bool IsSelectedPeriodClosed { get; set; }
    /// <summary>
    /// Mewakili Active Period Name.
    /// </summary>

    public string ActivePeriodName { get; set; } = string.Empty;
    /// <summary>
    /// Mewakili Active Period Start.
    /// </summary>

    public DateTime ActivePeriodStart { get; set; }
    /// <summary>
    /// Mewakili Active Period End.
    /// </summary>

    public DateTime ActivePeriodEnd { get; set; }
    /// <summary>
    /// Mewakili Total Cash And Equivalents.
    /// </summary>

    public decimal TotalCashAndEquivalents { get; set; }
    /// <summary>
    /// Mewakili Total Assets.
    /// </summary>

    public decimal TotalAssets { get; set; }
    /// <summary>
    /// Mewakili Total Liabilities.
    /// </summary>

    public decimal TotalLiabilities { get; set; }
    /// <summary>
    /// Mewakili Revenue This Period.
    /// </summary>

    public decimal RevenueThisPeriod { get; set; }
    /// <summary>
    /// Mewakili Operating Expenses.
    /// </summary>

    public decimal OperatingExpenses { get; set; }
    /// <summary>
    /// Mewakili Net Income.
    /// </summary>

    public decimal NetIncome { get; set; }
    /// <summary>
    /// Mewakili Revenue Trend Percent.
    /// </summary>

    public decimal? RevenueTrendPercent { get; set; }
    /// <summary>
    /// Mewakili Expense Trend Percent.
    /// </summary>

    public decimal? ExpenseTrendPercent { get; set; }
    /// <summary>
    /// Mewakili Net Income Trend Percent.
    /// </summary>

    public decimal? NetIncomeTrendPercent { get; set; }
    /// <summary>
    /// Mewakili Chart Labels.
    /// </summary>

    public List<string> ChartLabels { get; set; } = new();
    /// <summary>
    /// Mewakili Chart Revenue.
    /// </summary>

    public List<decimal> ChartRevenue { get; set; } = new();
    /// <summary>
    /// Mewakili Chart Expenses.
    /// </summary>

    public List<decimal> ChartExpenses { get; set; } = new();
    /// <summary>
    /// Mewakili Expense Category Labels.
    /// </summary>

    public List<string> ExpenseCategoryLabels { get; set; } = new();
    /// <summary>
    /// Mewakili Expense Category Values.
    /// </summary>

    public List<decimal> ExpenseCategoryValues { get; set; } = new();
    /// <summary>
    /// Mewakili Main Coa Balances.
    /// </summary>

    public List<CoaBalanceDto> MainCoaBalances { get; set; } = new();
    /// <summary>
    /// Mewakili Recent Journals.
    /// </summary>

    public List<JournalEntryDto> RecentJournals { get; set; } = new();
    /// <summary>
    /// Mewakili Monthly Burn Rate.
    /// </summary>

    public decimal MonthlyBurnRate { get; set; }
    /// <summary>
    /// Mewakili Cash Runway Months.
    /// </summary>

    public double CashRunwayMonths { get; set; }
    /// <summary>
    /// Mewakili Financial Health Score.
    /// </summary>

    public int FinancialHealthScore { get; set; }
}
