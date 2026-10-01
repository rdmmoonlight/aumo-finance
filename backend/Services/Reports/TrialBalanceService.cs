using TrialBalanceRow = AumoBackend.DTOs.Reports.TrialBalanceRow;
using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public interface ITrialBalanceService
{
    Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
        AppDbContext db,
        Guid userId,
        Period period,
        bool includeAdjusting = false,
        string reportType = "unadjusted");

    Task<decimal> ComputeRetainedEarningsEndingAsync(AppDbContext db, Guid userId, Period period);
}

public class TrialBalanceService : ITrialBalanceService
{
    public async Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
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

            decimal netBalance = normalDebit
                ? (totalDebitLines - totalCreditLines)
                : (totalCreditLines - totalDebitLines);

            decimal debit = 0m;
            decimal credit = 0m;

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

    public async Task<decimal> ComputeRetainedEarningsEndingAsync(AppDbContext db, Guid userId, Period period)
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
        if (string.IsNullOrEmpty(account.Type)) return false;
        return AccountClassificationHelper.NormalBalanceIsDebit(account.Type);
    }

    private static bool IsAccountPermanent(ChartOfAccount account)
    {
        if (string.IsNullOrEmpty(account.Type)) return false;
        return AccountClassificationHelper.IsPermanent(account.Type);
    }

    private static bool IsTemporaryType(string? typeStr)
    {
        if (string.IsNullOrEmpty(typeStr)) return false;
        return AccountClassificationHelper.IsTemporary(typeStr);
    }
}
