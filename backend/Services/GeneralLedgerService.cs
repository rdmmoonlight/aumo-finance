using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public interface IGeneralLedgerService
{
    Task<List<LedgerAccountResponse>> BuildLedgersAsync(AppDbContext db, Guid userId, Period period, bool isTemporary);
}

public class GeneralLedgerService : IGeneralLedgerService
{
    public async Task<List<LedgerAccountResponse>> BuildLedgersAsync(AppDbContext db, Guid userId, Period period, bool isTemporary)
    {
        var allAccounts = await db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var accounts = isTemporary
            ? allAccounts.Where(a => AccountClassification.IsTemporary(a.Type)).ToList()
            : allAccounts.Where(a => AccountClassification.IsPermanent(a.Type)).ToList();

        var accountIds = accounts.Select(a => a.Id).ToList();

        var lines = await db.JournalEntryLines
            .Include(l => l.JournalEntry)
            .Where(l => accountIds.Contains(l.AccountId) && l.JournalEntry!.UserId == userId)
            .OrderBy(l => l.JournalEntry!.EntryDate)
            .ThenBy(l => l.JournalEntry!.Id)
            .ThenBy(l => l.LineOrder)
            .ToListAsync();

        var result = new List<LedgerAccountResponse>();

        foreach (var account in accounts)
        {
            var normalDebit = AccountClassification.NormalBalanceIsDebit(account.Type);
            decimal running = 0;

            var accountLines = lines.Where(l => l.AccountId == account.Id
                && l.JournalEntry!.EntryDate >= period.StartDate
                && l.JournalEntry!.EntryDate <= period.EndDate);

            var ledgerLines = new List<LedgerLineResponse>();
            foreach (var line in accountLines)
            {
                running += normalDebit ? (line.Debit - line.Credit) : (line.Credit - line.Debit);
                ledgerLines.Add(new LedgerLineResponse
                {
                    JournalEntryId = line.JournalEntryId,
                    EntryDate = line.JournalEntry!.EntryDate.ToString("yyyy-MM-dd"),
                    Description = line.LineDescription ?? string.Empty,
                    Debit = line.Debit,
                    Credit = line.Credit,
                    RunningBalance = running
                });
            }

            if (isTemporary && period.IsClosed && running != 0)
            {
                var closingDebit = normalDebit ? Math.Max(-running, 0) : Math.Max(running, 0);
                var closingCredit = normalDebit ? Math.Max(running, 0) : Math.Max(-running, 0);
                running = 0m;

                ledgerLines.Add(new LedgerLineResponse
                {
                    JournalEntryId = 0,
                    EntryDate = period.EndDate.ToString("yyyy-MM-dd"),
                    Description = "closing journal",
                    Debit = closingDebit,
                    Credit = closingCredit,
                    RunningBalance = running
                });
            }

            result.Add(new LedgerAccountResponse
            {
                AccountId = account.Id,
                ReferenceNumber = account.ReferenceNumber,
                AccountName = account.AccountName,
                Type = account.Type,
                NormalBalanceIsDebit = normalDebit,
                EndingBalance = running,
                Lines = ledgerLines
            });
        }

        return result;
    }
}
