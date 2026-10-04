using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Periods;
using AumoBackend.Services.GeneralLedgers;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AumoBackend.Services.Periods;

public class PeriodsService : IPeriodsService
{
    private readonly AppDbContext _db;
    private readonly ITransactionNumberService _txNumberService;
    private readonly IGeneralLedgerService _glService;

    public PeriodsService(
        AppDbContext db, 
        ITransactionNumberService txNumberService,
        IGeneralLedgerService glService)
    {
        _db = db;
        _txNumberService = txNumberService;
        _glService = glService;
    }

    public async Task<GetPeriodsResponse> GetPeriodsAsync(Guid userId)
    {
        var periodsData = await _db.Periods
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.StartDate)
            .Select(p => new PeriodDto
            {
                Id = p.Id,
                PeriodName = p.PeriodName,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                IsClosed = p.IsClosed,
                IsSelected = p.IsSelected
            })
            .ToListAsync();

        var selectedPeriod = periodsData.FirstOrDefault(p => p.IsSelected);
        int? selectedPeriodId = selectedPeriod?.Id;

        if (!selectedPeriodId.HasValue)
        {
            var selectedFromHelper = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
            selectedPeriodId = selectedFromHelper?.Id;
        }

        var periods = periodsData.Select(p => new PeriodDto
        {
            Id = p.Id,
            PeriodName = p.PeriodName,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            IsClosed = p.IsClosed,
            IsSelected = selectedPeriodId.HasValue ? (p.Id == selectedPeriodId.Value) : p.IsSelected
        }).ToList();

        return new GetPeriodsResponse
        {
            Success = true,
            SelectedPeriodId = selectedPeriodId,
            Periods = periods
        };
    }

    public async Task<OpenPeriodInfoResponse> GetOpenPeriodInfoAsync(Guid userId)
    {
        var accounts = await _db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var permanentAccounts = accounts
            .Where(a => a.Type == "Assets" || a.Type == "Liabilities" || a.Type == "Equity")
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel
            })
            .ToList();

        var availableCashAndBank = accounts.Where(a => a.Role == "CashAndEquivalents")
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel
            })
            .ToList();

        var availableRetainedEarnings = accounts.Where(a => a.Role == "RetainedEarnings")
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel
            })
            .ToList();

        var hasExistingPermanentAccounts = availableCashAndBank.Any() && availableRetainedEarnings.Any();

        return new OpenPeriodInfoResponse
        {
            Success = true,
            HasExistingPermanentAccounts = hasExistingPermanentAccounts,
            AvailableCashAndBankAccounts = availableCashAndBank,
            AvailableRetainedEarningsAccounts = availableRetainedEarnings,
            PermanentAccounts = permanentAccounts
        };
    }

    public async Task<CreatePeriodResult> CreatePeriodAsync(Guid userId, CreatePeriodRequest request)
    {
        var startDate = DateTime.SpecifyKind(new DateTime(request.Year, request.Month, 1), DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1).AddDays(-1);
        var periodName = startDate.ToString("MMMM yyyy");
        var isLoadExisting = request.SetupMode == CreatePeriodRequest.ModeLoadExisting;

        var strategy = _db.Database.CreateExecutionStrategy();

        try
        {
            return await strategy.ExecuteAsync(async () =>
            {
                _db.ChangeTracker.Clear();

                await using var transaction = await _db.Database.BeginTransactionAsync();

                var periodExists = await _db.Periods.AnyAsync(p => p.UserId == userId && p.StartDate == startDate);
                if (periodExists)
                {
                    return Fail($"Period {periodName} already exists.");
                }

                if (isLoadExisting)
                {
                    var cashAccount = await _db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.CashAccountId && a.UserId == userId);
                    var bankAccount = await _db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.BankAccountId && a.UserId == userId);
                    var retainedAccount = await _db.ChartOfAccounts.FirstOrDefaultAsync(a => a.Id == request.RetainedEarningsAccountId && a.UserId == userId);

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
                        IsSelected = false
                    };
                    _db.Periods.Add(newPeriod);
                    await _db.SaveChangesAsync();

                    var opening = await AddOpeningBalanceJournalAsync(userId, startDate, retainedAccount);
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
                        PeriodId = newPeriod.Id
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

                    var codeInUse = await _db.ChartOfAccounts.AnyAsync(a => a.UserId == userId
                        && (a.ReferenceNumber == cashCode || a.ReferenceNumber == bankCode || a.ReferenceNumber == retainedCode));
                    if (codeInUse)
                    {
                        return Fail("One or more account reference numbers are already in use in your Chart of Accounts.");
                    }

                    var cashAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = cashCode, AccountName = request.CashAccountName!.Trim(), Type = "Assets", Role = "CashAndEquivalents", IsActive = true };
                    var bankAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = bankCode, AccountName = request.BankAccountName!.Trim(), Type = "Assets", Role = "CashAndEquivalents", IsActive = true };
                    var retainedAccount = new ChartOfAccount { UserId = userId, ReferenceNumber = retainedCode, AccountName = request.RetainedEarningsAccountName!.Trim(), Type = "Equity", Role = "RetainedEarnings", IsActive = true };

                    _db.ChartOfAccounts.AddRange(cashAccount, bankAccount, retainedAccount);

                    var newPeriod = new Period
                    {
                        UserId = userId,
                        PeriodName = periodName,
                        StartDate = startDate,
                        EndDate = endDate,
                        IsClosed = false,
                        IsSelected = false
                    };
                    _db.Periods.Add(newPeriod);
                    await _db.SaveChangesAsync();

                    var cashBalance = request.CashBalance ?? 0;
                    var bankBalance = request.BankBalance ?? 0;
                    var totalOpeningBalance = cashBalance + bankBalance;

                    if (totalOpeningBalance != 0)
                    {
                        var transactionNumber = await _txNumberService.GenerateAsync(userId, "General", startDate);

                        var journalEntry = new JournalEntry
                        {
                            UserId = userId,
                            TransactionNumber = transactionNumber,
                            JournalType = "General",
                            EntryDate = startDate,
                            CreatedAt = DateTime.UtcNow
                        };
                        _db.JournalEntries.Add(journalEntry);
                        await _db.SaveChangesAsync();

                        var lines = new List<JournalEntryLine>();
                        int order = 0;
                        if (cashBalance != 0)
                            lines.Add(new JournalEntryLine { JournalEntryId = journalEntry.Id, AccountId = cashAccount.Id, Debit = cashBalance, Credit = 0, LineDescription = "Saldo Awal", LineOrder = order++ });
                        if (bankBalance != 0)
                            lines.Add(new JournalEntryLine { JournalEntryId = journalEntry.Id, AccountId = bankAccount.Id, Debit = bankBalance, Credit = 0, LineDescription = "Saldo Awal", LineOrder = order++ });
                        lines.Add(new JournalEntryLine { JournalEntryId = journalEntry.Id, AccountId = retainedAccount.Id, Debit = 0, Credit = totalOpeningBalance, LineDescription = "Saldo Awal", LineOrder = order++ });

                        _db.JournalEntryLines.AddRange(lines);
                        await _db.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return new CreatePeriodResult
                    {
                        Success = true,
                        Message = $"Period {newPeriod.PeriodName} has been opened successfully.",
                        PeriodId = newPeriod.Id
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
                Message = $"Failed to open period: {ex.InnerException?.Message ?? ex.Message}"
            };
        }

        static CreatePeriodResult Fail(string message) => new() { Success = false, Message = message };
    }

    private static readonly string[] PermanentTypes = { "Assets", "Liabilities", "Equity" };
    private static readonly string[] TemporaryTypes = { "OperatingIncome", "OtherIncome", "OperatingExpenses", "OtherExpenses" };

    private sealed record OpeningResult(int AccountCount, string? Error);

    private async Task<OpeningResult> AddOpeningBalanceJournalAsync(Guid userId, DateTime startDate, ChartOfAccount retainedAccount)
    {
        var previous = await _db.Periods
            .AsNoTracking()
            .Where(p => p.UserId == userId && p.StartDate < startDate)
            .OrderByDescending(p => p.StartDate)
            .FirstOrDefaultAsync();

        if (previous == null) return new OpeningResult(0, null);

        var prevStart = previous.StartDate.Date;
        var prevEnd = previous.EndDate.Date.AddDays(1).AddTicks(-1);

        if (!PermanentTypes.Contains(retainedAccount.Type))
        {
            return new OpeningResult(0, "The selected Retained Earnings account must be an Equity account.");
        }

        var accounts = await _db.ChartOfAccounts
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.IsActive)
            .ToListAsync();

        if (accounts.All(a => a.Id != retainedAccount.Id)) accounts.Add(retainedAccount);

        var totals = await _db.JournalEntryLines
            .AsNoTracking()
            .Where(l => l.JournalEntry!.UserId == userId
                     && (l.JournalEntry.JournalType == "General" || l.JournalEntry.JournalType == "Adjusting")
                     && l.JournalEntry.EntryDate >= prevStart
                     && l.JournalEntry.EntryDate <= prevEnd)
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
            if (balance != 0m) balances.Add((account, balance));
        }

        if (balances.Count == 0) return new OpeningResult(0, null);

        var totalDebit = balances.Where(b => b.Signed > 0).Sum(b => b.Signed);
        var totalCredit = balances.Where(b => b.Signed < 0).Sum(b => -b.Signed);
        if (Math.Round(totalDebit - totalCredit, 2) != 0m)
        {
            return new OpeningResult(0,
                $"Saldo Awal is not balanced (debit {totalDebit:N2} vs credit {totalCredit:N2}). Check the journals of {previous.PeriodName}.");
        }

        var transactionNumber = await _txNumberService.GenerateAsync(userId, "General", startDate);

        var journalEntry = new JournalEntry
        {
            UserId = userId,
            TransactionNumber = transactionNumber,
            JournalType = "General",
            EntryDate = startDate,
            CreatedAt = DateTime.UtcNow
        };
        _db.JournalEntries.Add(journalEntry);
        await _db.SaveChangesAsync();

        int order = 0;
        var lines = balances.Select(b => new JournalEntryLine
        {
            JournalEntryId = journalEntry.Id,
            AccountId = b.Account.Id,
            Debit = b.Signed > 0 ? b.Signed : 0m,
            Credit = b.Signed < 0 ? -b.Signed : 0m,
            LineDescription = "Saldo Awal",
            LineOrder = order++
        }).ToList();

        _db.JournalEntryLines.AddRange(lines);
        await _db.SaveChangesAsync();

        return new OpeningResult(balances.Count, null);
    }

    public async Task<SelectPeriodResult?> SelectPeriodAsync(Guid userId, int periodId)
    {
        var entity = await _db.Periods.FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);
        if (entity == null) return null;

        await _db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        await _db.Periods
            .Where(p => p.Id == periodId && p.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, true));

        await SelectedPeriodHelper.SelectPeriodAsync(_db, userId, entity.Id);

        // Regenerasikan data staging General Ledgers untuk periode terpilih
        await _glService.RefreshGeneralLedgersAsync(userId);

        return new SelectPeriodResult
        {
            Success = true,
            SelectedPeriodId = entity.Id,
            Message = $"Now viewing {entity.PeriodName}" + (entity.IsClosed ? " (Closed)." : ".")
        };
    }

    public async Task<BaseServiceResult> ClearSelectionAsync(Guid userId)
    {
        // Bersihkan staging table sebelum menghilangkan penanda pilihan
        await _glService.ClearSelectedPeriodLedgersAsync(userId);

        await _db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        await SelectedPeriodHelper.ClearSelectionAsync(_db, userId);

        return new BaseServiceResult
        {
            Success = true,
            Message = "Period selection cleared."
        };
    }

    public async Task<BaseServiceResult> ClosePeriodAsync(Guid userId, int periodId)
    {
        var entity = await _db.Periods.FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);
        if (entity == null)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = "Accounting period not found."
            };
        }

        if (entity.IsClosed)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = $"Period {entity.PeriodName} is already closed."
            };
        }

        var hasEarlierOpenPeriod = await _db.Periods
            .AnyAsync(p => p.UserId == userId && p.Id != entity.Id && p.StartDate < entity.StartDate && !p.IsClosed);

        if (hasEarlierOpenPeriod)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = $"Cannot close {entity.PeriodName}: an earlier period is still open. Close earlier periods first."
            };
        }

        entity.IsClosed = true;
        await _db.SaveChangesAsync();

        return new BaseServiceResult
        {
            Success = true,
            Message = $"Period {entity.PeriodName} has been closed. Transactions in this period are now locked."
        };
    }
}
