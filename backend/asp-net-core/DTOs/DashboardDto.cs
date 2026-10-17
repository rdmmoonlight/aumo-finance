// <copyright file="DashboardDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs
{
    using System;
    using System.Collections.Generic;
    using AumoBackend.Controllers.Reports;
    using AumoBackend.Helpers;
    using AumoBackend.Models;
    /// <summary>
    /// Model data Dashboard Data Dto.
    /// </summary>

    public class DashboardDataDto
    {
        /// <summary>
        /// Mewakili Success.
        /// </summary>
        public bool Success { get; set; } = true;
        /// <summary>
        /// Mewakili Has Period Selected.
        /// </summary>

        public bool HasPeriodSelected { get; set; }
        /// <summary>
        /// Mewakili Selected Period Name.
        /// </summary>

        public string SelectedPeriodName { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Is Period Closed.
        /// </summary>

        public bool IsPeriodClosed { get; set; }
        /// <summary>
        /// Mewakili Total Assets.
        /// </summary>

        public decimal TotalAssets { get; set; }
        /// <summary>
        /// Mewakili Total Liabilities.
        /// </summary>

        public decimal TotalLiabilities { get; set; }
        /// <summary>
        /// Mewakili Total Equity.
        /// </summary>

        public decimal TotalEquity { get; set; }
        /// <summary>
        /// Mewakili Net Income.
        /// </summary>

        public decimal NetIncome { get; set; }
        /// <summary>
        /// Mewakili Total Cash On Hand.
        /// </summary>

        public decimal TotalCashOnHand { get; set; }
        /// <summary>
        /// Mewakili Total Bank Balance.
        /// </summary>

        public decimal TotalBankBalance { get; set; }
        /// <summary>
        /// Mewakili Total Assets Monthly.
        /// </summary>

        public decimal TotalAssetsMonthly { get; set; }
        /// <summary>
        /// Mewakili Total Assets Annual.
        /// </summary>

        public decimal TotalAssetsAnnual { get; set; }
        /// <summary>
        /// Mewakili Total Cash On Hand Monthly.
        /// </summary>

        public decimal TotalCashOnHandMonthly { get; set; }
        /// <summary>
        /// Mewakili Total Cash On Hand Annual.
        /// </summary>

        public decimal TotalCashOnHandAnnual { get; set; }
        /// <summary>
        /// Mewakili Total Bank Balance Monthly.
        /// </summary>

        public decimal TotalBankBalanceMonthly { get; set; }
        /// <summary>
        /// Mewakili Total Bank Balance Annual.
        /// </summary>

        public decimal TotalBankBalanceAnnual { get; set; }
        /// <summary>
        /// Mewakili Total Liabilities Monthly.
        /// </summary>

        public decimal TotalLiabilitiesMonthly { get; set; }
        /// <summary>
        /// Mewakili Total Liabilities Annual.
        /// </summary>

        public decimal TotalLiabilitiesAnnual { get; set; }
        /// <summary>
        /// Mewakili Total Assets Cumulative.
        /// </summary>

        public decimal TotalAssetsCumulative { get; set; }
        /// <summary>
        /// Mewakili Total Cash On Hand Cumulative.
        /// </summary>

        public decimal TotalCashOnHandCumulative { get; set; }
        /// <summary>
        /// Mewakili Total Bank Balance Cumulative.
        /// </summary>

        public decimal TotalBankBalanceCumulative { get; set; }
        /// <summary>
        /// Mewakili Total Liabilities Cumulative.
        /// </summary>

        public decimal TotalLiabilitiesCumulative { get; set; }
        /// <summary>
        /// Mewakili Total Revenue.
        /// </summary>

        public decimal TotalRevenue { get; set; }
        /// <summary>
        /// Mewakili Total Expenses.
        /// </summary>

        public decimal TotalExpenses { get; set; }
        /// <summary>
        /// Mewakili Accounts.
        /// </summary>

        public List<CoaBalanceDto> Accounts { get; set; } = new();
        /// <summary>
        /// Mewakili Cash Accounts.
        /// </summary>

        public List<CashAccountItemDto> CashAccounts { get; set; } = new();
        /// <summary>
        /// Mewakili Bank Accounts.
        /// </summary>

        public List<CashAccountItemDto> BankAccounts { get; set; } = new();
        /// <summary>
        /// Mewakili Cash Accounts Monthly.
        /// </summary>

        public List<CashAccountItemDto> CashAccountsMonthly { get; set; } = new();
        /// <summary>
        /// Mewakili Bank Accounts Monthly.
        /// </summary>

        public List<CashAccountItemDto> BankAccountsMonthly { get; set; } = new();
        /// <summary>
        /// Mewakili Cash Accounts Annual.
        /// </summary>

        public List<CashAccountItemDto> CashAccountsAnnual { get; set; } = new();
        /// <summary>
        /// Mewakili Bank Accounts Annual.
        /// </summary>

        public List<CashAccountItemDto> BankAccountsAnnual { get; set; } = new();
        /// <summary>
        /// Mewakili Expense Accounts List.
        /// </summary>

        public List<ExpenseAccountItemDto> ExpenseAccountsList { get; set; } = new();
        /// <summary>
        /// Mewakili Chart Trend.
        /// </summary>

        public List<ChartTrendItemDto> ChartTrend { get; set; } = new();
        /// <summary>
        /// Mewakili Recent Entries.
        /// </summary>

        public List<RecentActivityDto> RecentEntries { get; set; } = new();
    }
    /// <summary>
    /// Model data Coa Balance Dto.
    /// </summary>

    public class CoaBalanceDto
    {
        /// <summary>
        /// Mewakili Code.
        /// </summary>
        public string Code { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Name.
        /// </summary>

        public string Name { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Account Code.
        /// </summary>

        public string AccountCode { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Account Name.
        /// </summary>

        public string AccountName { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Category.
        /// </summary>

        public string Category { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Balance.
        /// </summary>

        public decimal Balance { get; set; }
    }
    /// <summary>
    /// Model data Cash Account Item Dto.
    /// </summary>

    public class CashAccountItemDto
    {
        /// <summary>
        /// Mewakili Account Id.
        /// </summary>
        public object AccountId { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Reference Number.
        /// </summary>

        public string ReferenceNumber { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Account Name.
        /// </summary>

        public string AccountName { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Name.
        /// </summary>

        public string Name { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Is Bank.
        /// </summary>

        public bool IsBank { get; set; }
        /// <summary>
        /// Mewakili Balance.
        /// </summary>

        public decimal Balance { get; set; }
    }
    /// <summary>
    /// Model data Expense Account Item Dto.
    /// </summary>

    public class ExpenseAccountItemDto
    {
        /// <summary>
        /// Mewakili Account Id.
        /// </summary>
        public object AccountId { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Reference Number.
        /// </summary>

        public string ReferenceNumber { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Account Name.
        /// </summary>

        public string AccountName { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Name.
        /// </summary>

        public string Name { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Amount.
        /// </summary>

        public decimal Amount { get; set; }
        /// <summary>
        /// Mewakili Balance.
        /// </summary>

        public decimal Balance { get; set; }
    }
    /// <summary>
    /// Model data Chart Trend Item Dto.
    /// </summary>

    public class ChartTrendItemDto
    {
        /// <summary>
        /// Mewakili Label.
        /// </summary>
        public string Label { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Period.
        /// </summary>

        public string Period { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Revenue.
        /// </summary>

        public decimal Revenue { get; set; }
        /// <summary>
        /// Mewakili Expense.
        /// </summary>

        public decimal Expense { get; set; }
        /// <summary>
        /// Mewakili Expenses.
        /// </summary>

        public decimal Expenses { get; set; }
        /// <summary>
        /// Mewakili Net.
        /// </summary>

        public decimal Net { get; set; }
    }
    /// <summary>
    /// Model data Recent Activity Dto.
    /// </summary>

    public class RecentActivityDto
    {
        /// <summary>
        /// Mewakili Title.
        /// </summary>
        public string Title { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Description.
        /// </summary>

        public string Description { get; set; } = string.Empty;
        /// <summary>
        /// Mewakili Timestamp.
        /// </summary>

        public DateTime Timestamp { get; set; }
    }
}
