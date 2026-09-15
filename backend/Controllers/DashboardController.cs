using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/api/v1/dashboard")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetDashboardData([FromQuery] string period = "monthly")
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var activePeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);

        DateTime startDate, endDate;
        string displayPeriodName;

        if (string.Equals(period, "annual", StringComparison.OrdinalIgnoreCase))
        {
            int year = activePeriod?.StartDate.Year?? DateTime.UtcNow.Year;
            startDate = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            endDate = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);
            displayPeriodName = $"Annual {year}";
        }
        else
        {
            startDate = activePeriod?.StartDate?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            endDate = activePeriod?.EndDate?? startDate.AddMonths(1).AddDays(-1).Date.AddHours(23).AddMinutes(59).AddSeconds(59);
            displayPeriodName = activePeriod?.PeriodName?? "Current Period";
        }

        // Period scope: untuk Laba Rugi
        var periodLines = await _db.JournalEntryLines
           .AsNoTracking()
           .Where(l => l.JournalEntry!.UserId == userId
                     && l.JournalEntry.EntryDate >= startDate
                     && l.JournalEntry.EntryDate <= endDate)
           .Select(l => new { l.AccountId, l.Debit, l.Credit, l.JournalEntry!.EntryDate })
           .ToListAsync();

        // Cumulative scope: untuk Neraca (Kas, Hutang, Modal)
        var cumulativeLines = await _db.JournalEntryLines
           .AsNoTracking()
           .Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= endDate)
           .Select(l => new { l.AccountId, l.Debit, l.Credit })
           .ToListAsync();

        // --- 1. KAS & BANK (FIX: Harus Kumulatif) ---
        var cashBankAccounts = await _db.ChartOfAccounts
           .Where(a => a.UserId == userId && a.IsActive && a.Role == "CashAndEquivalents")
           .OrderBy(a => a.ReferenceNumber)
           .Select(a => new { a.Id, a.ReferenceNumber, a.AccountName })
           .ToListAsync();

        var cashBankBreakdown = cashBankAccounts.Select(a => {
            var bal = cumulativeLines.Where(l => l.AccountId == a.Id).Sum(l => l.Debit - l.Credit);
            bool isBank = a.AccountName.Contains("Bank", StringComparison.OrdinalIgnoreCase)
                       || a.AccountName.Contains("Rekening", StringComparison.OrdinalIgnoreCase);
            return new { accountId = a.Id, referenceNumber = a.ReferenceNumber, accountName = a.AccountName, balance = bal, isBank };
        }).ToList();

        var totalCashOnHand = cashBankBreakdown.Where(x =>!x.isBank).Sum(x => x.balance);
        var totalBankBalance = cashBankBreakdown.Where(x => x.isBank).Sum(x => x.balance);
        var totalAssets = cashBankBreakdown.Sum(x => x.balance); // Kumulatif

        // --- 2. PENDAPATAN & BEBAN (Period) ---
        var incomeTypes = new[] { "OperatingIncome", "Income", "Revenue" };
        var incomeIds = await _db.ChartOfAccounts.Where(a => a.UserId == userId && a.IsActive && incomeTypes.Contains(a.Type)).Select(a => a.Id).ToListAsync();
        var totalIncome = periodLines.Where(l => incomeIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit);

        var expenseTypes = new[] { "OperatingExpenses", "Expense", "Expenses" };
        var expenseAccountsMeta = await _db.ChartOfAccounts
           .Where(a => a.UserId == userId && a.IsActive && expenseTypes.Contains(a.Type))
           .OrderBy(a => a.ReferenceNumber)
           .Select(a => new { a.Id, a.ReferenceNumber, a.AccountName })
           .ToListAsync();

        var expenseBreakdown = expenseAccountsMeta
           .Select(a => new { accountId = a.Id, referenceNumber = a.ReferenceNumber, accountName = a.AccountName, balance = periodLines.Where(l => l.AccountId == a.Id).Sum(l => l.Debit - l.Credit) })
           .Where(a => a.balance!= 0)
           .ToList();

        var totalExpense = expenseBreakdown.Where(x => x.balance > 0).Sum(x => x.balance);
        var netIncome = totalIncome - totalExpense;

        // --- 3. LIABILITIES & EQUITY (Kumulatif) ---
        var liabilityTypes = new[] { "Liabilities", "Liability" };
        var liabilityIds = await _db.ChartOfAccounts.Where(a => a.UserId == userId && a.IsActive && liabilityTypes.Contains(a.Type)).Select(a => a.Id).ToListAsync();
        var totalLiabilities = cumulativeLines.Where(l => liabilityIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit);

        var equityIds = await _db.ChartOfAccounts.Where(a => a.UserId == userId && a.IsActive && a.Type == "Equity").Select(a => a.Id).ToListAsync();
        var totalEquity = cumulativeLines.Where(l => equityIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit);

        // --- 4. DATA UNTUK CHARTJS (Monthly Trend) ---
        // Jika annual -> group per bulan, jika monthly -> group per hari
        var isAnnual = string.Equals(period, "annual", StringComparison.OrdinalIgnoreCase);
        var trendData = isAnnual
           ? Enumerable.Range(1, 12).Select(m => {
                var monthLines = periodLines.Where(l => l.EntryDate.Month == m);
                var rev = monthLines.Where(l => incomeIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit);
                var exp = monthLines.Where(l => expenseAccountsMeta.Select(e=>e.Id).Contains(l.AccountId)).Sum(l => l.Debit - l.Credit);
                return new { label = new DateTime(2000, m, 1).ToString("MMM"), revenue = rev, expense = exp, net = rev - exp };
            }).ToList()
            : periodLines.GroupBy(l => l.EntryDate.Date).OrderBy(g => g.Key).Select(g => {
                var rev = g.Where(l => incomeIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit);
                var exp = g.Where(l => expenseAccountsMeta.Select(e=>e.Id).Contains(l.AccountId)).Sum(l => l.Debit - l.Credit);
                return new { label = g.Key.ToString("dd MMM"), revenue = rev, expense = exp, net = rev - exp };
            }).ToList();

        return Ok(new
        {
            success = true,
            hasPeriodSelected = activePeriod!= null,
            selectedPeriodName = displayPeriodName,
            isPeriodClosed = activePeriod?.IsClosed?? false,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalRevenue = totalIncome,
            totalExpenses = totalExpense,
            netIncome,
            cashAccounts = cashBankBreakdown.Where(x =>!x.isBank),
            totalCashOnHand,
            bankAccounts = cashBankBreakdown.Where(x => x.isBank),
            totalBankBalance,
            expenseAccountsList = expenseBreakdown,
            chartTrend = trendData,
            recentEntries = Array.Empty<object>()
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdStr, out Guid userId)? userId : Guid.Empty;
    }
}
