using System.Security.Claims;
using AumoBackend.Models;
using AumoBackend.Services; // pake service yang udah kita fix tadi
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
    private readonly ITrialBalanceService _tbService;
    public TrialBalanceController(AppDbContext db, ITrialBalanceService tbService)
    {
        _db = db;
        _tbService = tbService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrialBalance([FromQuery] string type = "unadjusted")
        => await ProcessTrialBalanceAsync(type);

    [HttpGet("unadjusted")] public Task<IActionResult> GetUnadjustedTrialBalance() => ProcessTrialBalanceAsync("unadjusted");
    [HttpGet("adjusted")] public Task<IActionResult> GetAdjustedTrialBalance() => ProcessTrialBalanceAsync("adjusted");
    [HttpGet("post-closing")] public Task<IActionResult> GetPostClosingTrialBalance() => ProcessTrialBalanceAsync("post-closing");

    private async Task<IActionResult> ProcessTrialBalanceAsync(string type)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(new { success = false, message = "Invalid user" });

        string normalizedType = type?.ToLower().Trim() switch
        {
            "adjusted" => "adjusted",
            "postclosing" or "post-closing" => "post-closing",
            _ => "unadjusted"
        };

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new { success = true, hasPeriodSelected = false, reportTitle = normalizedType, totalDebit = 0m, totalCredit = 0m, isBalanced = true, rows = Array.Empty<object>() });
        }

        // PAKE SERVICE YANG UDAH FIX, JANGAN BUILD MANUAL DI CONTROLLER LAGI
        List<TrialBalanceRow> rows = normalizedType switch
        {
            "adjusted" => await _tbService.GetAdjustedAsync(userId, period.StartDate, period.EndDate),
            "post-closing" => await _tbService.GetPostClosingAsync(userId, period.EndDate),
            _ => await _tbService.GetUnadjustedAsync(userId, period.StartDate, period.EndDate)
        };

        // FIX KHUSUS POST-CLOSING: Hitung RE ending yang bener
        if (normalizedType == "post-closing")
        {
            var reEnding = await ComputeRetainedEarningsEndingFixedAsync(_db, userId, period);
            var reRow = rows.FirstOrDefault(r => r.Type == "Equity" && r.Name.Contains("Retained", StringComparison.OrdinalIgnoreCase));
            if (reRow!= null)
            {
                // replace row RE dengan saldo ending yang bener
                rows.Remove(reRow);
                rows.Add(reRow with { Debit = reEnding < 0? -reEnding : 0, Credit = reEnding > 0? reEnding : 0, NetBalance = reEnding });
            }
            else if (reEnding!= 0)
            {
                var reAccount = await _db.ChartOfAccounts.FirstOrDefaultAsync(a => a.UserId == userId && a.Type == "Equity" && a.Role == "RetainedEarnings");
                if (reAccount!= null)
                    rows.Add(new TrialBalanceRow(reAccount.ReferenceNumber.ToString(), reAccount.AccountName, reAccount.Type!, reEnding > 0? 0 : -reEnding, reEnding > 0? reEnding : 0, reEnding));
            }
            rows = rows.OrderBy(r => r.Code).ToList();
        }

        decimal totalDebit = rows.Sum(r => r.Debit);
        decimal totalCredit = rows.Sum(r => r.Credit);

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            reportTitle = normalizedType,
            type = normalizedType,
            totalDebit,
            totalCredit,
            isBalanced = Math.Round(totalDebit - totalCredit, 2) == 0,
            rows
        });
    }

    // INI YANG BENER BUAT RE ENDING
    private static async Task<decimal> ComputeRetainedEarningsEndingFixedAsync(AppDbContext db, Guid userId, Period period)
    {
        var startUtc = period.StartDate.Date;
        var endUtc = period.EndDate.Date.AddDays(1).AddTicks(-1);
        var startMinusOne = startUtc.AddTicks(-1);

        // 1. Saldo awal RE kumulatif sampai sebelum periode ini mulai
        var reInitialLines = await db.JournalEntryLines
           .Include(l => l.JournalEntry)
           .Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= startMinusOne)
           .Where(l => l.Account.Role == "RetainedEarnings")
           .ToListAsync();
        decimal initialRE = reInitialLines.Sum(l => l.Credit - l.Debit); // RE normal credit

        // 2. Net Income cuma dalam periode ini (General + Adjusting)
        var periodLines = await db.JournalEntryLines
           .Include(l => l.JournalEntry).Include(l => l.Account)
           .Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate >= startUtc && l.JournalEntry.EntryDate <= endUtc)
           .Where(l => l.JournalEntry!.JournalType == "General" || l.JournalEntry!.JournalType == "Adjusting")
           .ToListAsync();

        decimal revenue = periodLines.Where(l => l.Account.Type == "OperatingIncome" || l.Account.Type == "OtherIncome").Sum(l => l.Credit - l.Debit);
        decimal expense = periodLines.Where(l => l.Account.Type == "OperatingExpenses" || l.Account.Type == "OtherExpenses").Sum(l => l.Debit - l.Credit);

        return initialRE + (revenue - expense);
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdStr, out Guid userId)? userId : Guid.Empty;
    }
}