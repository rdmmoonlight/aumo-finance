using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Models;
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

    public TrialBalanceController(AppDbContext db)
    {
        _db = db;
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
        var rows = await BuildTrialBalanceRowsAsync(_db, userId, period, includeAdjusting, normalizedType);

        if (normalizedType == "post-closing")
        {
            var reEndingBalance = await ComputeRetainedEarningsEndingAsync(_db, userId, period);
            
            // Perbaikan CS1503 / CS0200: Cari berdasarkan string role secara presisi
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
                    bool isDebit = IsAccountNormalBalanceDebit(reAccount);

                    rows.Add(new TrialBalanceRow
                    {
                        AccountId = reAccount.Id,
                        ReferenceNumber = reAccount.ReferenceNumber,
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

    public static async Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
        AppDbContext db,
        Guid userId,
        Period period,
        bool includeAdjusting = false,
        string reportType = "unadjusted")
    {
        var accounts = await db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var accountIds = accounts.Select(a => a.Id).ToList();

        var startUtc = period.StartDate.Date;
        var endUtc = period.EndDate.Date.AddDays(1).AddTicks(-1);

        var linesQuery = db.JournalEntryLines
            .Include(l => l.JournalEntry)
            .Where(l => accountIds.Contains(l.AccountId)
                     && l.JournalEntry!.UserId == userId
                     && l.JournalEntry!.EntryDate >= startUtc
                     && l.JournalEntry!.EntryDate <= endUtc);

        bool includeAdjustingLines = includeAdjusting || reportType == "adjusted" || reportType == "post-closing";

        var lines = includeAdjustingLines
            ? await linesQuery.Where(l => l.JournalEntry!.JournalType == "General"
                                       || l.JournalEntry!.JournalType == "Adjusting").ToListAsync()
            : await linesQuery.Where(l => l.JournalEntry!.JournalType == "General").ToListAsync();

        var rows = new List<TrialBalanceRow>();
        foreach (var account in accounts)
        {
            bool isPermanent = IsAccountPermanent(account);

            if (reportType == "post-closing" && !isPermanent)
            {
                continue;
            }

            var accountLines = lines.Where(l => l.AccountId == account.Id).ToList();
            if (!accountLines.Any()) continue;

            bool normalDebit = IsAccountNormalBalanceDebit(account);
            decimal netBalance = normalDebit
                ? accountLines.Sum(l => l.Debit - l.Credit)
                : accountLines.Sum(l => l.Credit - l.Debit);

            decimal debit = 0m;
            decimal credit = 0m;

            if (normalDebit)
            {
                if (netBalance >= 0) debit = netBalance;
                else credit = Math.Abs(netBalance);
            }
            else
            {
                if (netBalance >= 0) credit = netBalance;
                else debit = Math.Abs(netBalance);
            }

            rows.Add(new TrialBalanceRow
            {
                AccountId = account.Id,
                ReferenceNumber = account.ReferenceNumber,
                AccountName = account.AccountName,
                Type = account.Type,
                Role = account.Role,
                NormalBalanceIsDebit = normalDebit,
                NetBalance = netBalance,
                Debit = debit,
                Credit = credit
            });
        }

        return rows;
    }

    private static async Task<decimal> ComputeRetainedEarningsEndingAsync(AppDbContext db, Guid userId, Period period)
    {
        var rows = await BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: true, reportType: "adjusted");

        decimal totalRevenue = rows
            .Where(r => !r.NormalBalanceIsDebit && IsTemporaryType(r.Type))
            .Sum(r => r.NetBalance);

        decimal totalExpense = rows
            .Where(r => r.NormalBalanceIsDebit && IsTemporaryType(r.Type))
            .Sum(r => r.NetBalance);

        decimal netIncome = totalRevenue - totalExpense;

        var reRow = rows.FirstOrDefault(r => string.Equals(r.Role ?? string.Empty, "RetainedEarnings", StringComparison.OrdinalIgnoreCase));
        decimal initialRE = reRow?.NetBalance ?? 0m;

        return initialRE + netIncome;
    }

    private static bool IsAccountNormalBalanceDebit(ChartOfAccount account)
    {
        string accountType = (account.Type ?? string.Empty).ToLower();
        return accountType.Contains("asset") ||
               accountType.Contains("expense") ||
               accountType.Contains("aktiva") ||
               accountType.Contains("beban") ||
               accountType.Contains("biaya");
    }

    private static bool IsAccountPermanent(ChartOfAccount account)
    {
        string accountType = (account.Type ?? string.Empty).ToLower();
        return accountType.Contains("asset") ||
               accountType.Contains("liability") ||
               accountType.Contains("equity") ||
               accountType.Contains("aktiva") ||
               accountType.Contains("pasiva") ||
               accountType.Contains("modal");
    }

    private static bool IsTemporaryType(string? typeStr)
    {
        if (string.IsNullOrEmpty(typeStr)) return false;

        string t = typeStr.ToLower();
        return t.Contains("revenue") ||
               t.Contains("income") ||
               t.Contains("expense") ||
               t.Contains("pendapatan") ||
               t.Contains("beban") ||
               t.Contains("biaya");
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
