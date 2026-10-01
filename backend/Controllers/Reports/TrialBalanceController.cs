using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/api/v1/reports/trial-balance")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class TrialBalanceController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITrialBalanceService _trialBalanceService;

    public TrialBalanceController(AppDbContext db, ITrialBalanceService trialBalanceService)
    {
        _db = db;
        _trialBalanceService = trialBalanceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrialBalance([FromQuery] string type = "unadjusted")
    {
        return await ProcessTrialBalanceAsync(type);
    }

    [HttpGet("unadjusted")]
    public async Task<IActionResult> GetUnadjustedTrialBalance()
    {
        return await ProcessTrialBalanceAsync("unadjusted");
    }

    [HttpGet("adjusted")]
    public async Task<IActionResult> GetAdjustedTrialBalance()
    {
        return await ProcessTrialBalanceAsync("adjusted");
    }

    [HttpGet("post-closing")]
    public async Task<IActionResult> GetPostClosingTrialBalance()
    {
        return await ProcessTrialBalanceAsync("post-closing");
    }

    private async Task<IActionResult> ProcessTrialBalanceAsync(string type)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        string normalizedType = type?.ToLower().Trim() switch
        {
            "adjusted" => "adjusted",
            "postclosing" or "post-closing" => "post-closing",
            _ => "unadjusted"
        };

        string title = normalizedType switch
        {
            "adjusted" => "Adjusted Trial Balance",
            "post-closing" => "Post-Closing Trial Balance",
            _ => "Trial Balance (Unadjusted)"
        };

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                reportTitle = title,
                type = normalizedType,
                totalDebit = 0m,
                totalCredit = 0m,
                isBalanced = true,
                rows = Array.Empty<object>()
            });
        }

        bool includeAdjusting = normalizedType == "adjusted" || normalizedType == "post-closing";
        var rows = await _trialBalanceService.BuildTrialBalanceRowsAsync(_db, userId, period, includeAdjusting, normalizedType);

        if (normalizedType == "post-closing")
        {
            var reEndingBalance = await _trialBalanceService.ComputeRetainedEarningsEndingAsync(_db, userId, period);

            var reRowIndex = rows.FindIndex(r => string.Equals(r.Role ?? string.Empty, "RetainedEarnings", StringComparison.OrdinalIgnoreCase));

            decimal reDebit = reEndingBalance < 0 ? Math.Abs(reEndingBalance) : 0m;
            decimal reCredit = reEndingBalance >= 0 ? reEndingBalance : 0m;

            if (reRowIndex >= 0)
            {
                var oldRow = rows[reRowIndex];
                rows[reRowIndex] = new TrialBalanceRow
                {
                    AccountId = oldRow.AccountId,
                    ReferenceNumber = oldRow.ReferenceNumber,
                    AccountName = oldRow.AccountName,
                    Type = oldRow.Type,
                    Role = oldRow.Role,
                    NormalBalanceIsDebit = oldRow.NormalBalanceIsDebit,
                    NetBalance = reEndingBalance,
                    Debit = reDebit,
                    Credit = reCredit
                };
            }
            else if (reEndingBalance != 0)
            {
                var reAccount = await _db.ChartOfAccounts
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.IsActive && a.Role == "RetainedEarnings");

                if (reAccount != null)
                {
                    bool isDebit = AccountClassification.NormalBalanceIsDebit(reAccount.Type);

                    rows.Add(new TrialBalanceRow
                    {
                        AccountId = reAccount.Id,
                        ReferenceNumber = reAccount.ReferenceNumber.ToString(),
                        AccountName = reAccount.AccountName,
                        Type = reAccount.Type,
                        Role = reAccount.Role,
                        NormalBalanceIsDebit = isDebit,
                        NetBalance = reEndingBalance,
                        Debit = reDebit,
                        Credit = reCredit
                    });
                    rows.Sort((a, b) => string.Compare(a.ReferenceNumber ?? string.Empty, b.ReferenceNumber ?? string.Empty, StringComparison.Ordinal));
                }
            }
        }

        decimal totalDebit = rows.Sum(r => r.Debit);
        decimal totalCredit = rows.Sum(r => r.Credit);
        bool isBalanced = Math.Abs(totalDebit - totalCredit) < 0.01m;

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            reportTitle = title,
            type = normalizedType,
            totalDebit = totalDebit,
            totalCredit = totalCredit,
            isBalanced = isBalanced,
            rows = rows
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
