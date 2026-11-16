namespace AumoBackend.Services.Periods;

using System.Globalization;
using AumoBackend.Data;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.EntityFrameworkCore;

public partial class PeriodsService
{
    public async Task<CreatePeriodResult> CreatePeriodAsync(Guid userId, CreatePeriodRequest request)
    {
        var startDate = DateTime.SpecifyKind(new DateTime(request.Year, request.Month, 1), DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1).AddDays(-1);
        var periodName = startDate.ToString("MMMM yyyy", CultureInfo.InvariantCulture);
        var isLoadExisting = request.SetupMode == CreatePeriodRequest.ModeLoadExisting;

        var strategy = this.db.Database.CreateExecutionStrategy();

        try
        {
            // Pre-step (di luar transaksi pembuatan periode). SelectPeriodAsync memakai
            // transaksi dan execution strategy sendiri (RefreshGeneralLedgersAsync), sehingga
            // tidak boleh dipanggil di dalam transaksi di bawah.
            if (await this.db.Periods.AnyAsync(p => p.UserId == userId && p.StartDate == startDate))
            {
                return Fail($"Period {periodName} already exists.");
            }

            var previous = await this.db.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId && p.StartDate < startDate)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

            // Periode sebelumnya wajib ditutup dulu sebelum periode baru dibuka.
            if (previous != null && !previous.IsClosed)
            {
                return Fail($"Period {previous.PeriodName} must be closed before opening {periodName}.");
            }

            // Saldo Awal dihitung dari tabel sumber. Pilih periode sebelumnya terlebih dahulu
            // supaya IsSelected berpindah ke sana dan datanya dipulihkan dari arsip.
            if (isLoadExisting && previous != null)
            {
                var selected = await this.SelectPeriodAsync(userId, previous.Id);
                if (selected is not { Success: true })
                {
                    return Fail($"Failed to load the data of {previous.PeriodName}. The new period was not opened.");
                }
            }

            return await strategy.ExecuteAsync(async () =>
            {
                this.db.ChangeTracker.Clear();

                await using var transaction = await this.db.Database.BeginTransactionAsync();

                var periodExists = await this.db.Periods.AnyAsync(p => p.UserId == userId && p.StartDate == startDate);
                if (periodExists)
                {
                    return Fail($"Period {periodName} already exists.");
                }

                if (isLoadExisting)
                {
                    var cashAccount = await this.db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.CashAccountId && a.UserId == userId);
                    var bankAccount = await this.db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.BankAccountId && a.UserId == userId);
                    var retainedAccount = await this.db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.RetainedEarningsAccountId && a.UserId == userId);

                    if (cashAccount == null || bankAccount == null || retainedAccount == null)
                    {
                        return Fail("One or more selected accounts could not be found.");
                    }

                    if (retainedAccount.Role != "RetainedEarnings")
                    {
                        return Fail("The selected Retained Earnings account is not a Retained Earnings account.");
                    }

                    var newPeriod = new Period
                    {
                        UserId = userId,
                        PeriodName = periodName,
                        StartDate = startDate,
                        EndDate = endDate,
                        IsClosed = false,
                        IsSelected = false,
                    };
                    this.db.Periods.Add(newPeriod);
                    await this.db.SaveChangesAsync();

                    var opening = await this.AddOpeningBalanceJournalAsync(userId, startDate, retainedAccount);
                    if (opening.Error != null)
                    {
                        return Fail(opening.Error);
                    }

                    await transaction.CommitAsync();

                    var carryInfo = opening.AccountCount > 0
                        ? $" Saldo Awal journal created for {opening.AccountCount} permanent accounts."
                        : " No previous period balances to carry forward.";

                    return new CreatePeriodResult
                    {
                        Success = true,
                        Message = $"Period {newPeriod.PeriodName} has been opened successfully.{carryInfo}",
                        PeriodId = newPeriod.Id,
                    };
                }
                else
                {
                    if (!int.TryParse(request.CashAccountCode, out var cashCode)
                        || !int.TryParse(request.BankAccountCode, out var bankCode)
                        || !int.TryParse(request.RetainedEarningsAccountCode, out var retainedCode))
                    {
                        return Fail("Account reference codes must be numeric.");
                    }

                    if (cashCode == bankCode || cashCode == retainedCode || bankCode == retainedCode)
                    {
                        return Fail("Cash, Bank, and Retained Earnings accounts must use different reference numbers.");
                    }

                    var codeInUse = await this.db.ChartOfAccounts.AnyAsync(a => a.UserId == userId
                        && (a.ReferenceNumber == cashCode || a.ReferenceNumber == bankCode || a.ReferenceNumber == retainedCode));
                    if (codeInUse)
                    {
                        return Fail("One or more account reference numbers are already in use in your Chart of Accounts.");
                    }

                    var cashAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = cashCode, AccountName = request.CashAccountName!.Trim(), Type = "Assets", Role = "CashAndEquivalents", IsActive = true };
                    var bankAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = bankCode, AccountName = request.BankAccountName!.Trim(), Type = "Assets", Role = "CashAndEquivalents", IsActive = true };
                    var retainedAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = retainedCode, AccountName = request.RetainedEarningsAccountName!.Trim(), Type = "Equity", Role = "RetainedEarnings", IsActive = true };

                    this.db.ChartOfAccounts.AddRange(cashAccount, bankAccount, retainedAccount);

                    var newPeriod = new Period
                    {
                        UserId = userId,
                        PeriodName = periodName,
                        StartDate = startDate,
                        EndDate = endDate,
                        IsClosed = false,
                        IsSelected = false,
                    };
                    this.db.Periods.Add(newPeriod);
                    await this.db.SaveChangesAsync();

                    var cashBalance = request.CashBalance ?? 0;
                    var bankBalance = request.BankBalance ?? 0;
                    var totalOpeningBalance = cashBalance + bankBalance;

                    if (totalOpeningBalance != 0)
                    {
                        var transactionNumber = await this.txNumberService.GenerateAsync(userId, "General", startDate);

                        var openingLines = new List<GeneralJournalWriter.Line>();
                        if (cashBalance != 0)
                        {
                            openingLines.Add(new GeneralJournalWriter.Line(cashAccount.Id, "Saldo Awal", cashBalance, 0));
                        }

                        if (bankBalance != 0)
                        {
                            openingLines.Add(new GeneralJournalWriter.Line(bankAccount.Id, "Saldo Awal", bankBalance, 0));
                        }

                        openingLines.Add(new GeneralJournalWriter.Line(retainedAccount.Id, "Saldo Awal", 0, totalOpeningBalance));

                        int journalEntryId = await GeneralJournalWriter.NextJournalEntryIdAsync(this.db);

                        this.db.GeneralJournals.AddRange(GeneralJournalWriter.BuildRows(
                            journalEntryId, userId, transactionNumber, "General",
                            startDate, DateTime.UtcNow, null, openingLines));
                        await this.db.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return new CreatePeriodResult
                    {
                        Success = true,
                        Message = $"Period {newPeriod.PeriodName} has been opened successfully.",
                        PeriodId = newPeriod.Id,
                    };
                }
            });
        }
        catch (Exception ex)
        {
            return new CreatePeriodResult
            {
                Success = false,
                IsServerError = true,
                Message = $"Failed to open period: {ex.InnerException?.Message ?? ex.Message}",
            };
        }

        static CreatePeriodResult Fail(string message) => new() { Success = false, Message = message };
    }

    private sealed record OpeningResult(int AccountCount, string? Error);

    private async Task<OpeningResult> AddOpeningBalanceJournalAsync(Guid userId, DateTime startDate, ChartOfAccount retainedAccount)
    {
        var previous = await this.db.Periods
            .AsNoTracking()
            .Where(p => p.UserId == userId && p.StartDate < startDate)
            .OrderByDescending(p => p.StartDate)
            .FirstOrDefaultAsync();

        if (previous == null)
        {
            return new OpeningResult(0, null);
        }

        var prevStart = DateTime.SpecifyKind(previous.StartDate.Date, DateTimeKind.Utc);
        var prevEnd = DateTime.SpecifyKind(previous.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        if (!PermanentTypes.Contains(retainedAccount.Type))
        {
            return new OpeningResult(0, "The selected Retained Earnings account must be an Equity account.");
        }

        var accounts = await this.db.ChartOfAccounts
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.IsActive)
            .ToListAsync();

        if (accounts.All(a => a.Id != retainedAccount.Id))
        {
            accounts.Add(retainedAccount);
        }

        var totals = await this.db.GeneralJournals
            .AsNoTracking()
            .Where(l => l.UserId == userId
                     && (l.JournalType == "General" || l.JournalType == "Adjusting" || l.JournalType == "Reversing")
                     && l.EntryDate >= prevStart
                     && l.EntryDate <= prevEnd)
            .GroupBy(l => l.AccountId)
            .Select(g => new { AccountId = g.Key, Debit = g.Sum(x => x.Debit), Credit = g.Sum(x => x.Credit) })
            .ToDictionaryAsync(x => x.AccountId);

        decimal Signed(ChartOfAccount a) =>
            totals.TryGetValue(a.Id, out var t) ? t.Debit - t.Credit : 0m;

        decimal netIncome = accounts
            .Where(a => TemporaryTypes.Contains(a.Type))
            .Sum(a => -Signed(a));

        var balances = new List<(ChartOfAccount Account, decimal Signed)>();
        foreach (var account in accounts.Where(a => PermanentTypes.Contains(a.Type)).OrderBy(a => a.ReferenceNumber))
        {
            var balance = Signed(account);
            if (account.Id == retainedAccount.Id)
            {
                balance -= netIncome;
            }

            balance = Math.Round(balance, 2);
            if (balance != 0m)
            {
                balances.Add((account, balance));
            }
        }

        if (balances.Count == 0)
        {
            return new OpeningResult(0, null);
        }

        var totalDebit = balances.Where(b => b.Signed > 0).Sum(b => b.Signed);
        var totalCredit = balances.Where(b => b.Signed < 0).Sum(b => -b.Signed);
        if (Math.Round(totalDebit - totalCredit, 2) != 0m)
        {
            return new OpeningResult(
                0,
                $"Saldo Awal is not balanced (debit {totalDebit:N2} vs credit {totalCredit:N2}). Check the journals of {previous.PeriodName}.");
        }

        var transactionNumber = await this.txNumberService.GenerateAsync(userId, "General", startDate);

        var openingLines = balances.Select(b => new GeneralJournalWriter.Line(
            b.Account.Id,
            "Saldo Awal",
            b.Signed > 0 ? b.Signed : 0m,
            b.Signed < 0 ? -b.Signed : 0m)).ToList();

        int journalEntryId = await GeneralJournalWriter.NextJournalEntryIdAsync(this.db);

        this.db.GeneralJournals.AddRange(GeneralJournalWriter.BuildRows(
            journalEntryId, userId, transactionNumber, "General",
            startDate, DateTime.UtcNow, null, openingLines));
        await this.db.SaveChangesAsync();

        return new OpeningResult(balances.Count, null);
    }
}
