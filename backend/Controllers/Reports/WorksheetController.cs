using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/api/v1/reports/worksheet")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class WorksheetController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWorksheetService _worksheetService;
    private readonly ITrialBalanceService _trialBalanceService;

    public WorksheetController(
        AppDbContext db,
        IWorksheetService worksheetService,
        ITrialBalanceService trialBalanceService)
    {
        _db = db;
        _worksheetService = worksheetService;
        _trialBalanceService = trialBalanceService;
    }

    // ==========================================
    // 1. GET: /api/v1/reports/worksheet
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetWorksheet()
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
                rows = Array.Empty<object>(),
                totals = new { }
            });
        }

        var worksheetRows = await _worksheetService.BuildWorksheetRowsAsync(_db, userId, period, _trialBalanceService);

        decimal totalUnadjustedDebit = worksheetRows.Sum(r => r.UnadjustedDebit);
        decimal totalUnadjustedCredit = worksheetRows.Sum(r => r.UnadjustedCredit);
        decimal totalAdjustmentDebit = worksheetRows.Sum(r => r.AdjustmentDebit);
        decimal totalAdjustmentCredit = worksheetRows.Sum(r => r.AdjustmentCredit);
        decimal totalAdjustedDebit = worksheetRows.Sum(r => r.AdjustedDebit);
        decimal totalAdjustedCredit = worksheetRows.Sum(r => r.AdjustedCredit);
        decimal totalIncomeStatementDebit = worksheetRows.Sum(r => r.IncomeStatementDebit);
        decimal totalIncomeStatementCredit = worksheetRows.Sum(r => r.IncomeStatementCredit);
        decimal totalFinancialPositionDebit = worksheetRows.Sum(r => r.FinancialPositionDebit);
        decimal totalFinancialPositionCredit = worksheetRows.Sum(r => r.FinancialPositionCredit);

        decimal netIncome = totalIncomeStatementCredit - totalIncomeStatementDebit;

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            rows = worksheetRows.Select(r => new
            {
                accountId = r.AccountId,
                referenceNumber = r.ReferenceNumber,
                accountName = r.AccountName,
                type = r.Type,
                normalBalanceIsDebit = r.NormalBalanceIsDebit,
                tbDebit = r.UnadjustedDebit,
                tbCredit = r.UnadjustedCredit,
                adjDebit = r.AdjustmentDebit,
                adjCredit = r.AdjustmentCredit,
                adjTbDebit = r.AdjustedDebit,
                adjTbCredit = r.AdjustedCredit,
                isDebit = r.IncomeStatementDebit,
                isCredit = r.IncomeStatementCredit,
                bsDebit = r.FinancialPositionDebit,
                bsCredit = r.FinancialPositionCredit
            }),
            totals = new
            {
                tbDebit = totalUnadjustedDebit,
                tbCredit = totalUnadjustedCredit,
                adjDebit = totalAdjustmentDebit,
                adjCredit = totalAdjustmentCredit,
                adjTbDebit = totalAdjustedDebit,
                adjTbCredit = totalAdjustedCredit,
                isDebit = totalIncomeStatementDebit,
                isCredit = totalIncomeStatementCredit,
                bsDebit = totalFinancialPositionDebit,
                bsCredit = totalFinancialPositionCredit,
                netIncome = netIncome
            }
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
