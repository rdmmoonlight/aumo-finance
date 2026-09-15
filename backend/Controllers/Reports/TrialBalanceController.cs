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

            var reRowIndex = rows.FindIndex(r => string.Equals(r.Role ?? string.Empty, "RetainedEarnings", StringComparison.OrdinalIgnoreCase));

            // Retained Earnings adalah akun Ekuitas (Normal Balance = Credit)
            // Saldo positif berarti Credit, saldo negatif berarti Debit
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
            
            decimal totalDebitLines = accountLines.Sum(l => l.Debit);
            decimal totalCreditLines = accountLines.Sum(l => l.Credit);

            // Hitung net balance sesuai saldo normal
            decimal netBalance = normalDebit
                ? (totalDebitLines - totalCreditLines)
                : (totalCreditLines - totalDebitLines);

            decimal debit = 0m;
            decimal credit = 0m;

            // Masukkan angka selisih ke kolom Debit/Credit murni berdasarkan mana yang lebih besar
            // (Mencegah pergeseran kolom berlebihan pada kontra akun)
            if (totalDebitLines >= totalCreditLines)
            {
                debit = totalDebitLines - totalCreditLines;
            }
            else
            {
                credit = totalCreditLines - totalDebitLines;
            }

            rows.Add(new TrialBalanceRow
            {
                AccountId = account.Id,
                ReferenceNumber = account.ReferenceNumber.ToString(),
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
        // Ambil data Adjusted Trial Balance lengkap (termasuk akun sementara)
        var rows = await BuildTrialBalanceRowsAsync(db, userId, period, includeAdjusting: true, reportType: "adjusted");

        // Pendapatan: Akun sementara dengan saldo normal Credit (NetBalance positif = Kredit > Debit)
        decimal totalRevenue = rows
            .Where(r => !r.NormalBalanceIsDebit && IsTemporaryType(r.Type))
            .Sum(r => r.NetBalance);

        // Beban: Akun sementara dengan saldo normal Debit (NetBalance positif = Debit > Kredit)
        decimal totalExpense = rows
            .Where(r => r.NormalBalanceIsDebit && IsTemporaryType(r.Type))
            .Sum(r => r.NetBalance);

        decimal netIncome = totalRevenue - totalExpense;

        // Ambil saldo awal Retained Earnings sebelum jurnal penutup
        var reRow = rows.FirstOrDefault(r => string.Equals(r.Role ?? string.Empty, "RetainedEarnings", StringComparison.OrdinalIgnoreCase));
        decimal initialRE = reRow?.NetBalance ?? 0m;

        return initialRE + netIncome;
    }

    private static bool IsAccountNormalBalanceDebit(ChartOfAccount account)
    {
        if (string.IsNullOrEmpty(account.Type)) return false;
        return AccountClassification.NormalBalanceIsDebit(account.Type);
    }

    private static bool IsAccountPermanent(ChartOfAccount account)
    {
        if (string.IsNullOrEmpty(account.Type)) return false;
        return AccountClassification.IsPermanent(account.Type);
    }

    private static bool IsTemporaryType(string? typeStr)
    {
        if (string.IsNullOrEmpty(typeStr)) return false;
        return AccountClassification.IsTemporary(typeStr);
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
