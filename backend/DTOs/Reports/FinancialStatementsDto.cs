using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using AumoBackend.DTOs;
namespace AumoBackend.DTOs.Reports;

public class IncomeStatementApiResponse
{
    public string PeriodName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime AsOfDate { get; set; }
    public decimal TotalRevenues { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalOperatingExpenses { get; set; }
    public decimal OperatingIncome { get; set; }
    public List<IncomeStatementLineApiResponse> OtherIncome { get; set; } = new();
    public decimal TotalOtherIncome { get; set; }
    public List<IncomeStatementLineApiResponse> OtherExpenses { get; set; } = new();
    public decimal TotalOtherExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public List<IncomeStatementLineApiResponse> Revenues { get; set; } = new();
    public List<IncomeStatementLineApiResponse> Expenses { get; set; } = new();
    public List<IncomeStatementLineApiResponse> OperatingExpenses { get; set; } = new();
}

public class IncomeStatementLineApiResponse
{
    public string ReferenceNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class RetainedEarningsApiResponse
{
    public string PeriodName { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal BeginningBalance { get; set; }
    public decimal EndingBalance { get; set; }
    public decimal NetIncome { get; set; }
    public decimal Dividends { get; set; }
}

public class StatementOfCashFlowLineResponse
{
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class StatementOfFinancialPositionApiResponse
{
    public string PeriodName { get; set; } = string.Empty;
    public DateTime AsOfDate { get; set; }
    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }
    public decimal TotalEquity { get; set; }
    public decimal TotalLiabilitiesAndEquity { get; set; }
    public List<FinancialPositionLineApiResponse> EquityExcludingRetainedEarnings { get; set; } = new();
    public decimal RetainedEarningsEnding { get; set; }
    public bool IsPostClosing { get; set; }
    public bool IsBalanced { get; set; }
    public List<FinancialPositionLineApiResponse> Assets { get; set; } = new();
    public List<FinancialPositionLineApiResponse> Liabilities { get; set; } = new();
    public List<FinancialPositionLineApiResponse> Equity { get; set; } = new();
}

public class FinancialPositionLineApiResponse
{
    public string ReferenceNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
