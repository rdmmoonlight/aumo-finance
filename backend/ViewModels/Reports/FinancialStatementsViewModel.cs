using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.ViewModels.Reports;

public class CashFlowStatementViewModel
{
    public decimal BeginningCash { get; set; }
    public List<CashFlowLine> OperatingActivities { get; set; } = new();
    public List<CashFlowLine> InvestingActivities { get; set; } = new();
    public List<CashFlowLine> FinancingActivities { get; set; } = new();

    public decimal NetOperating => OperatingActivities.Sum(l => l.Amount);
    public decimal NetInvesting => InvestingActivities.Sum(l => l.Amount);
    public decimal NetFinancing => FinancingActivities.Sum(l => l.Amount);
    public decimal NetChangeInCash => NetOperating + NetInvesting + NetFinancing;
    public decimal EndingCash => BeginningCash + NetChangeInCash;
}

public class IncomeStatementViewModel
{
    public DateTime AsOfDate { get; set; }

    public List<IncomeStatementLine> Revenues { get; set; } = new();
    public List<IncomeStatementLine> OperatingExpenses { get; set; } = new();
    public List<IncomeStatementLine> OtherIncome { get; set; } = new();
    public List<IncomeStatementLine> OtherExpenses { get; set; } = new();

    public decimal TotalRevenue => Revenues.Sum(l => l.Amount);
    public decimal TotalOperatingExpenses => OperatingExpenses.Sum(l => l.Amount);
    public decimal OperatingIncome => TotalRevenue - TotalOperatingExpenses;

    public decimal TotalOtherIncome => OtherIncome.Sum(l => l.Amount);
    public decimal TotalOtherExpenses => OtherExpenses.Sum(l => l.Amount);

    public decimal NetIncome => OperatingIncome + TotalOtherIncome - TotalOtherExpenses;
}

public class StatementOfFinancialPositionViewModel
{
    public DateTime AsOfDate { get; set; }
    public bool IsPostClosing { get; set; }

    public List<FinancialPositionLine> Assets { get; set; } = new();
    public List<FinancialPositionLine> Liabilities { get; set; } = new();
    public List<FinancialPositionLine> EquityExcludingRetainedEarnings { get; set; } = new();
    public decimal RetainedEarningsEnding { get; set; }

    public decimal TotalAssets => Assets.Sum(l => l.Amount);
    public decimal TotalLiabilities => Liabilities.Sum(l => l.Amount);
    public decimal TotalEquity => EquityExcludingRetainedEarnings.Sum(l => l.Amount) + RetainedEarningsEnding;
    public decimal TotalLiabilitiesAndEquity => TotalLiabilities + TotalEquity;
    public bool IsBalanced => Math.Round(TotalAssets - TotalLiabilitiesAndEquity, 2) == 0;
}

public class RetainedEarningsViewModel
{
    public string AccountName { get; set; } = "Retained Earnings";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal BeginningBalance { get; set; }
    public decimal NetIncome { get; set; }
    public decimal Dividends { get; set; }
    public decimal EndingBalance => BeginningBalance + NetIncome - Dividends;
}
