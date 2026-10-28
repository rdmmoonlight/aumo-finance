using System.Globalization;
using System.Security.Claims;
using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("reports/trial-balance")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class TrialBalanceController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NeondbContext _neonDb;
    private readonly ITrialBalanceService _trialBalanceService;

    public TrialBalanceController(
        AppDbContext db,
        NeondbContext neonDb,
        ITrialBalanceService trialBalanceService)
    {
        _db = db;
        _neonDb = neonDb;
        _trialBalanceService = trialBalanceService;
    }

    // GET /reports/trial-balance?type=unadjusted|adjusted|post-closing
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? type = "unadjusted")
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "User identity invalid." });
        }

        var reportType = (type ?? "unadjusted").Trim().ToLowerInvariant().Replace("_", "-");
        if (reportType == "postclosing")
        {
            reportType = "post-closing";
        }

        var title = reportType switch
        {
            "unadjusted" => "Neraca Saldo",
            "adjusted" => "Neraca Saldo Disesuaikan",
            "post-closing" => "Neraca Saldo Pasca-Penutupan",
            _ => null
        };

        if (title == null)
        {
            return BadRequest(new { success = false, message = "type harus unadjusted, adjusted, atau post-closing." });
        }

        var period = await ResolveSelectedPeriodAsync(userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                selectedPeriodName = (string?)null,
                reportTitle = title,
                type = reportType,
                totalDebit = 0m,
                totalCredit = 0m,
                isBalanced = true,
                rows = Array.Empty<object>()
            });
        }

        var rows = await BuildTrialBalanceRowsAsync(
            _db,
            period,
            includeAdjusting: reportType != "unadjusted",
            extra: reportType);

        if (reportType == "post-closing")
        {
            await ApplyClosingToRetainedEarningsAsync(userId, period, rows);
        }

        var totalDebit = rows.Sum(r => r.Debit);
        var totalCredit = rows.Sum(r => r.Credit);

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            reportTitle = title,
            type = reportType,
            totalDebit,
            totalCredit,
            isBalanced = Math.Round(totalDebit - totalCredit, 2) == 0,
            rows = rows.Select(r => new
            {
                accountId = r.AccountId,
                referenceNumber = r.ReferenceNumber,
                accountName = r.AccountName,
                type = r.Type,
                role = r.Role ?? string.Empty,
                normalBalanceIsDebit = r.NormalBalanceIsDebit,
                netBalance = r.NetBalance,
                debit = r.Debit,
                credit = r.Credit
            })
        });
    }

    // Pasca-penutupan: akun temporer sudah dikeluarkan oleh service; saldo
    // Laba Ditahan harus memuat efek Closing (saldo awal + laba bersih),
    // kalau tidak kolom debit/kredit tidak seimbang.
    private async Task ApplyClosingToRetainedEarningsAsync(Guid userId, Period period, List<TrialBalanceRow> rows)
    {
        var endingRe = await _trialBalanceService.ComputeRetainedEarningsEndingAsync(_neonDb, userId, period);

        var reRow = rows.FirstOrDefault(r => string.Equals(r.Role, "RetainedEarnings", StringComparison.OrdinalIgnoreCase));
        if (reRow == null)
        {
            if (endingRe == 0m)
            {
                return;
            }

            var account = await _db.ChartOfAccounts.AsNoTracking()
                .Where(a => a.UserId == userId && a.IsActive && a.Role == "RetainedEarnings")
                .OrderBy(a => a.ReferenceNumber)
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return;
            }

            reRow = new TrialBalanceRow
            {
                AccountId = account.Id,
                ReferenceNumber = account.ReferenceNumber.ToString(CultureInfo.InvariantCulture),
                AccountName = account.AccountName,
                Type = account.Type,
                Role = account.Role,
                NormalBalanceIsDebit = false
            };
            rows.Add(reRow);
            rows.Sort((a, b) => string.CompareOrdinal(a.ReferenceNumber.PadLeft(10, '0'), b.ReferenceNumber.PadLeft(10, '0')));
        }

        reRow.NetBalance = endingRe;
        reRow.Debit = endingRe < 0m ? -endingRe : 0m;
        reRow.Credit = endingRe > 0m ? endingRe : 0m;
    }

    private async Task<Period?> ResolveSelectedPeriodAsync(Guid userId)
    {
        var selected = await _db.Periods.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId && x.IsSelected);
        if (selected != null)
        {
            return selected;
        }

        var helper = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (helper == null)
        {
            return null;
        }

        return await _db.Periods.AsNoTracking().FirstOrDefaultAsync(x => x.Id == helper.Id && x.UserId == userId);
    }

    private Guid GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(id, out var guid) ? guid : Guid.Empty;
    }

    private static Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
        object dbContext,
        object period = null!,
        bool includeAdjusting = false,
        object extra = null!)
    {
        return Task.FromResult(new List<TrialBalanceRow>());
    }
}