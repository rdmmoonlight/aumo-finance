using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Core;
using AumoBackend.DTOs;
using AumoBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/api/v1/reports")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class FinancialStatementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public FinancialStatementsController(AppDbContext db)
    {
        _db = db;
    }

    // ==========================================
    // 1. GET: /api/v1/reports/income-statement
    // ==========================================
    [HttpGet("income-statement")]
    public async Task<IActionResult> GetIncomeStatement()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                revenueAccounts = Array.Empty<object>(),
                expenseAccounts = Array.Empty<object>(),
                otherIncomeAccounts = Array.Empty<object>(),
                otherExpenseAccounts = Array.Empty<object>()
            });
        }

        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(_db, userId, period, includeAdjusting: true);
        var statementData = BuildIncomeStatement(rows, period);

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            asOfDate = statementData.AsOfDate,
            revenueAccounts = statementData.Revenues,
            totalRevenue = statementData.TotalRevenue,
            expenseAccounts = statementData.OperatingExpenses,
            totalExpenses = statementData.TotalOperatingExpenses,
            operatingIncome = statementData.OperatingIncome,
            otherIncomeAccounts = statementData.OtherIncome,
            otherExpenseAccounts = statementData.OtherExpenses,
            totalOtherIncome = statementData.TotalOtherIncome,
            totalOtherExpenses = statementData.TotalOtherExpenses,
            netIncome = statementData.NetIncome
        });
    }

    // ==========================================
    // 2. GET: /api/v1/reports/retained-earnings
    // ==========================================
    [HttpGet("retained-earnings")]
    public async Task<IActionResult> GetRetainedEarnings()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                accountName = "Retained Earnings",
                startDate = (DateTime?)null,
                endDate = (DateTime?)null,
                beginningRetainedEarnings = 0m,
                netIncome = 0m,
                dividendsOrDraws = 0m,
                endingRetainedEarnings = 0m
            });
        }

        var statementData = await BuildRetainedEarningsAsync(_db, userId, period);

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            accountName = statementData.AccountName,
            startDate = statementData.StartDate,
            endDate = statementData.EndDate,
            beginningRetainedEarnings = statementData.BeginningBalance,
            netIncome = statementData.NetIncome,
            dividendsOrDraws = statementData.Dividends,
            endingRetainedEarnings = statementData.EndingBalance
        });
    }

    // ==========================================
    // 3. GET: /api/v1/reports/statement-of-cash-flow
    // ==========================================
    [HttpGet("statement-of-cash-flow")]
    public async Task<IActionResult> GetCashFlowStatement()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                operatingActivities = new List<StatementOfCashFlowLineResponse>(),
                netCashFromOperating = 0m,
                investingActivities = new List<StatementOfCashFlowLineResponse>(),
                netCashFromInvesting = 0m,
                financingActivities = new List<StatementOfCashFlowLineResponse>(),
                netCashFromFinancing = 0m,
                netChangeInCash = 0m,
                beginningCash = 0m,
                endingCash = 0m
            });
        }

        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(_db, userId, period, includeAdjusting: true);
        var incomeStatement = BuildIncomeStatement(rows, period);

        var cashRows = rows.Where(r => r.Role == "CashAndEquivalents").ToList();
        decimal endingCash = cashRows.Sum(r => r.NetBalance);

        var operatingActivities = new List<StatementOfCashFlowLineResponse>
        {
            new StatementOfCashFlowLineResponse
            {
                Description = "Net Income per Income Statement",
                Amount = incomeStatement.NetIncome
            }
        };

        var investingActivities = new List<StatementOfCashFlowLineResponse>();
        var financingActivities = new List<StatementOfCashFlowLineResponse>();

        foreach (var r in rows)
        {
            if (r.NetBalance == 0 || r.Role == "CashAndEquivalents" || r.Role == "RetainedEarnings")
                continue;

            int.TryParse(r.ReferenceNumber, out int refNum);

            if (AccountClassification.IsTemporary(r.Type ?? string.Empty) || refNum >= 400)
                continue;

            if (r.Type == "Assets" || (refNum >= 100 && refNum <= 199))
            {
                bool isFixedAsset = refNum >= 150 ||
                                    r.AccountName.Contains("Equipment", StringComparison.OrdinalIgnoreCase) ||
                                    r.AccountName.Contains("Depreciation", StringComparison.OrdinalIgnoreCase) ||
                                    r.AccountName.Contains("Asset", StringComparison.OrdinalIgnoreCase);

                if (isFixedAsset)
                    investingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Capital expenditure / Sale of {r.AccountName}", Amount = -r.NetBalance });
                else
                    operatingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Change in {r.AccountName}", Amount = -r.NetBalance });
            }
            else if (r.Type == "Liabilities" || (refNum >= 200 && refNum <= 299))
            {
                bool isLongTermDebt = refNum >= 250 ||
                                      r.AccountName.Contains("Bank Loan", StringComparison.OrdinalIgnoreCase) ||
                                      r.AccountName.Contains("Long Term", StringComparison.OrdinalIgnoreCase);

                if (isLongTermDebt)
                    financingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Change in {r.AccountName}", Amount = r.NetBalance });
                else
                    operatingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Change in {r.AccountName}", Amount = r.NetBalance });
            }
            else if (r.Type == "Equity" || (refNum >= 300 && refNum <= 399))
            {
                financingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Change in {r.AccountName}", Amount = r.NetBalance });
            }
            else
            {
                operatingActivities.Add(new StatementOfCashFlowLineResponse { Description = $"Adjustment for {r.AccountName}", Amount = -r.NetBalance });
            }
        }

        decimal netOperating = operatingActivities.Sum(a => a.Amount);
        decimal netInvesting = investingActivities.Sum(a => a.Amount);
        decimal netFinancing = financingActivities.Sum(a => a.Amount);

        decimal netChangeInCash = netOperating + netInvesting + netFinancing;
        decimal beginningCash = endingCash - netChangeInCash;

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            operatingActivities = operatingActivities,
            netCashFromOperating = netOperating,
            investingActivities = investingActivities,
            netCashFromInvesting = netInvesting,
            financingActivities = financingActivities,
            netCashFromFinancing = netFinancing,
            netChangeInCash = netChangeInCash,
            beginningCash = beginningCash,
            endingCash = endingCash
        });
    }

    // ==========================================
    // 4. GET: /api/v1/reports/statement-of-financial-position
    // ==========================================
    [HttpGet("statement-of-financial-position")]
    public async Task<IActionResult> GetStatementOfFinancialPosition([FromQuery] bool isPostClosing = false)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                assetAccounts = new List<object>(),
                totalAssets = 0m,
                liabilityAccounts = new List<object>(),
                totalLiabilities = 0m,
                equityAccounts = new List<object>(),
                totalEquity = 0m,
                totalLiabilitiesAndEquity = 0m,
                isBalanced = true
            });
        }

        var balanceSheetData = await BuildSofpAsync(_db, userId, period, isPostClosing);

        var equityAccountsWithRe = balanceSheetData.EquityExcludingRetainedEarnings
            .Select(e => new { accountId = 0, referenceNumber = e.ReferenceNumber ?? "", accountName = e.AccountName, amount = e.Amount })
            .Append(new { accountId = 0, referenceNumber = "0", accountName = "Retained Earnings", amount = balanceSheetData.RetainedEarningsEnding })
            .ToList();

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            asOfDate = balanceSheetData.AsOfDate,
            isPostClosing = balanceSheetData.IsPostClosing,
            assetAccounts = balanceSheetData.Assets.Select(a => new { accountId = 0, referenceNumber = a.ReferenceNumber, accountName = a.AccountName, amount = a.Amount }),
            totalAssets = balanceSheetData.TotalAssets,
            liabilityAccounts = balanceSheetData.Liabilities.Select(l => new { accountId = 0, referenceNumber = l.ReferenceNumber, accountName = l.AccountName, amount = l.Amount }),
            totalLiabilities = balanceSheetData.TotalLiabilities,
            equityAccounts = equityAccountsWithRe,
            totalEquity = balanceSheetData.TotalEquity,
            totalLiabilitiesAndEquity = balanceSheetData.TotalLiabilitiesAndEquity,
            isBalanced = balanceSheetData.IsBalanced
        });
    }

    // ==========================================
    // PUBLIC BUILDER METHODS
    // ==========================================
    public static IncomeStatementApiResponse BuildIncomeStatement(List<TrialBalanceRow> rows, Period period)
    {
        IncomeStatementLineApiResponse ToLine(TrialBalanceRow r) => new()
        {
            ReferenceNumber = r.ReferenceNumber ?? string.Empty,
            AccountName = r.AccountName,
            Amount = r.NetBalance
        };

        var revenues = rows.Where(r => r.Type == "OperatingIncome").Select(ToLine).ToList();
        var operatingExpenses = rows.Where(r => r.Type == "OperatingExpenses").Select(ToLine).ToList();
        var otherIncome = rows.Where(r => r.Type == "OtherIncome").Select(ToLine).ToList();
        var otherExpenses = rows.Where(r => r.Type == "OtherExpenses").Select(ToLine).ToList();

        decimal totalRevenue = revenues.Sum(r => r.Amount);
        decimal totalOperatingExpenses = operatingExpenses.Sum(e => e.Amount);
        decimal operatingIncome = totalRevenue - totalOperatingExpenses;

        decimal totalOtherIncome = otherIncome.Sum(i => i.Amount);
        decimal totalOtherExpenses = otherExpenses.Sum(e => e.Amount);

        decimal netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

        return new IncomeStatementApiResponse
        {
            AsOfDate = period.EndDate,
            Revenues = revenues,
            TotalRevenue = totalRevenue,
            OperatingExpenses = operatingExpenses,
            TotalOperatingExpenses = totalOperatingExpenses,
            OperatingIncome = operatingIncome,
            OtherIncome = otherIncome,
            TotalOtherIncome = totalOtherIncome,
            OtherExpenses = otherExpenses,
            TotalOtherExpenses = totalOtherExpenses,
            NetIncome = netIncome
        };
    }

    public static async Task<RetainedEarningsApiResponse> BuildRetainedEarningsAsync(AppDbContext db, Guid userId, Period period)
    {
        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: true);
        var incomeStatement = BuildIncomeStatement(rows, period);
        var reAccount = rows.Find(r => r.Role == "RetainedEarnings");

        decimal beginningBalance = reAccount?.NetBalance ?? 0m;
        decimal netIncome = incomeStatement.NetIncome;
        decimal dividends = 0m;
        decimal endingBalance = beginningBalance + netIncome - dividends;

        return new RetainedEarningsApiResponse
        {
            AccountName = reAccount?.AccountName ?? "Retained Earnings",
            StartDate = period.StartDate,
            EndDate = period.EndDate,
            BeginningBalance = beginningBalance,
            NetIncome = netIncome,
            Dividends = dividends,
            EndingBalance = endingBalance
        };
    }

    public static async Task<StatementOfFinancialPositionApiResponse> BuildSofpAsync(AppDbContext db, Guid userId, Period period, bool isPostClosing)
    {
        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: true);
        var re = await BuildRetainedEarningsAsync(db, userId, period);

        FinancialPositionLineApiResponse ToLine(TrialBalanceRow r) => new()
        {
            ReferenceNumber = r.ReferenceNumber ?? "",
            AccountName = r.AccountName ?? "",
            Amount = r.NetBalance
        };

        var assets = rows.Where(r => r.Type == "Assets").Select(ToLine).ToList();
        var liabilities = rows.Where(r => r.Type == "Liabilities").Select(ToLine).ToList();
        var equityExcludingRe = rows.Where(r => r.Type == "Equity" && r.Role != "RetainedEarnings").Select(ToLine).ToList();

        decimal totalAssets = assets.Sum(a => a.Amount);
        decimal totalLiabilities = liabilities.Sum(l => l.Amount);
        decimal totalEquityExcludingRe = equityExcludingRe.Sum(e => e.Amount);
        decimal retainedEarningsEnding = re.EndingBalance;

        decimal totalEquity = totalEquityExcludingRe + retainedEarningsEnding;
        decimal totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        bool isBalanced = Math.Round(totalAssets - totalLiabilitiesAndEquity, 2) == 0;

        return new StatementOfFinancialPositionApiResponse
        {
            AsOfDate = period.EndDate,
            IsPostClosing = isPostClosing,
            Assets = assets,
            TotalAssets = totalAssets,
            Liabilities = liabilities,
            TotalLiabilities = totalLiabilities,
            EquityExcludingRetainedEarnings = equityExcludingRe,
            RetainedEarningsEnding = retainedEarningsEnding,
            TotalEquity = totalEquity,
            TotalLiabilitiesAndEquity = totalLiabilitiesAndEquity,
            IsBalanced = isBalanced
        };
    }

    // ==========================================
    // PRIVATE HELPER METHODS
    // ==========================================
    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
