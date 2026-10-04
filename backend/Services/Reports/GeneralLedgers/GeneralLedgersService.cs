using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.Data;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services.Reports.GeneralLedgers;

public class GeneralLedgersService : IGeneralLedgersService
{
    private readonly AppDbContext _db;

    private static readonly string[] PermanentTypes =
    {
        "Assets",
        "Liabilities",
        "Equity"
    };

    private static readonly string[] TemporaryTypes =
    {
        "OperatingIncome",
        "OtherIncome",
        "OperatingExpenses",
        "OtherExpenses"
    };

    public GeneralLedgersService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BaseServiceResult> RefreshGeneralLedgersAsync(Guid userId)
    {
        // 1. Get the currently selected accounting period
        var selectedPeriod = await _db.Periods
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.IsSelected);

        if (selectedPeriod == null)
        {
            var periodFromHelper =
                await SelectedPeriodHelper.GetSelectedPeriodAsync(
                    _db,
                    userId);

            if (periodFromHelper != null)
            {
                selectedPeriod = await _db.Periods
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p =>
                        p.Id == periodFromHelper.Id &&
                        p.UserId == userId);
            }
        }

        if (selectedPeriod == null)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = "No period is currently selected."
            };
        }

        var strategy = _db.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            _db.ChangeTracker.Clear();

            await using var transaction =
                await _db.Database.BeginTransactionAsync();

            try
            {
                int periodId = selectedPeriod.Id;

                // 2. Clear existing staging ledger data for the selected period
                await ClearLedgerDataForPeriodAsync(
                    userId,
                    periodId);

                // 3. Get journal transactions within the selected period
                var startDate = selectedPeriod.StartDate.Date;
                var endDate = selectedPeriod.EndDate
                    .Date
                    .AddDays(1)
                    .AddTicks(-1);

                var journalLines = await _db.JournalEntryLines
                    .AsNoTracking()
                    .Include(l => l.JournalEntry)
                    .Include(l => l.Account)
                    .Where(l =>
                        l.JournalEntry!.UserId == userId &&
                        l.JournalEntry.EntryDate >= startDate &&
                        l.JournalEntry.EntryDate <= endDate)
                    .OrderBy(l => l.AccountId)
                    .ThenBy(l => l.JournalEntry!.EntryDate)
                    .ThenBy(l => l.JournalEntryId)
                    .ThenBy(l => l.LineOrder)
                    .ToListAsync();

                if (!journalLines.Any())
                {
                    await transaction.CommitAsync();

                    return new BaseServiceResult
                    {
                        Success = true,
                        Message =
                            $"General Ledger refreshed for period " +
                            $"{selectedPeriod.PeriodName} " +
                            $"(0 transactions found)."
                    };
                }

                // 4. Calculate running balances and separate
                //    permanent accounts from temporary accounts
                var permanentLedgers =
                    new List<PermanentAccountsGeneralLedger>();

                var temporaryLedgers =
                    new List<TemporaryAccountsGeneralLedger>();

                var groupedLines =
                    journalLines.GroupBy(l => l.AccountId);

                foreach (var group in groupedLines)
                {
                    var account = group.First().Account;

                    if (account == null)
                        continue;

                    decimal runningBalance = 0m;

                    bool isPermanent =
                        PermanentTypes.Contains(account.Type);

                    bool isTemporary =
                        TemporaryTypes.Contains(account.Type);

                    foreach (var line in group)
                    {
                        // Calculate running balance according to
                        // the account's normal balance:
                        //
                        // Debit-normal:
                        // Assets, OperatingExpenses, OtherExpenses
                        //
                        // Credit-normal:
                        // Liabilities, Equity, Income

                        if (account.Type == "Assets" ||
                            account.Type == "OperatingExpenses" ||
                            account.Type == "OtherExpenses")
                        {
                            runningBalance +=
                                line.Debit - line.Credit;
                        }
                        else
                        {
                            runningBalance +=
                                line.Credit - line.Debit;
                        }

                        if (isPermanent)
                        {
                            permanentLedgers.Add(
                                new PermanentAccountsGeneralLedger
                                {
                                    UserId = userId,
                                    PeriodId = periodId,
                                    AccountId = line.AccountId,
                                    JournalEntryId = line.JournalEntryId,
                                    JournalEntryLineId = line.Id,
                                    EntryDate =
                                        line.JournalEntry!.EntryDate,
                                    TransactionNumber =
                                        line.JournalEntry.TransactionNumber,
                                    LineDescription =
                                        line.LineDescription,
                                    Debit = line.Debit,
                                    Credit = line.Credit,
                                    RunningBalance = runningBalance
                                });
                        }
                        else if (isTemporary)
                        {
                            temporaryLedgers.Add(
                                new TemporaryAccountsGeneralLedger
                                {
                                    UserId = userId,
                                    PeriodId = periodId,
                                    AccountId = line.AccountId,
                                    JournalEntryId = line.JournalEntryId,
                                    JournalEntryLineId = line.Id,
                                    EntryDate =
                                        line.JournalEntry!.EntryDate,
                                    TransactionNumber =
                                        line.JournalEntry.TransactionNumber,
                                    LineDescription =
                                        line.LineDescription,
                                    Debit = line.Debit,
                                    Credit = line.Credit,
                                    RunningBalance = runningBalance
                                });
                        }
                    }
                }

                // 5. Bulk insert refreshed staging ledger data
                if (permanentLedgers.Any())
                {
                    _db.PermanentAccountsGeneralLedger
                        .AddRange(permanentLedgers);
                }

                if (temporaryLedgers.Any())
                {
                    _db.TemporaryAccountsGeneralLedger
                        .AddRange(temporaryLedgers);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return new BaseServiceResult
                {
                    Success = true,
                    Message =
                        $"General Ledger refreshed successfully " +
                        $"for period {selectedPeriod.PeriodName}."
                };
            }
            catch (Exception ex)
            {
                return new BaseServiceResult
                {
                    Success = false,
                    Message =
                        $"Failed to refresh General Ledger: " +
                        $"{ex.InnerException?.Message ?? ex.Message}"
                };
            }
        });
    }

    public async Task<BaseServiceResult> ClearSelectedPeriodLedgersAsync(
        Guid userId)
    {
        var selectedPeriod = await _db.Periods
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.IsSelected);

        if (selectedPeriod == null)
        {
            return new BaseServiceResult
            {
                Success = true,
                Message =
                    "No period selected. " +
                    "Staging ledger clear skipped."
            };
        }

        await ClearLedgerDataForPeriodAsync(
            userId,
            selectedPeriod.Id);

        return new BaseServiceResult
        {
            Success = true,
            Message =
                $"Cleared General Ledger staging tables " +
                $"for period {selectedPeriod.PeriodName}."
        };
    }

    private async Task ClearLedgerDataForPeriodAsync(
        Guid userId,
        int periodId)
    {
        await _db.PermanentAccountsGeneralLedger
            .Where(x =>
                x.UserId == userId &&
                x.PeriodId == periodId)
            .ExecuteDeleteAsync();

        await _db.TemporaryAccountsGeneralLedger
            .Where(x =>
                x.UserId == userId &&
                x.PeriodId == periodId)
            .ExecuteDeleteAsync();
    }
}
