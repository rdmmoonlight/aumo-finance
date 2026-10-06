using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AumoBackend.DTOs;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.Services.ChartOfAccounts;

public class ChartOfAccountsService : IChartOfAccountsService
{
    private readonly AppDbContext _db;

    public ChartOfAccountsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ChartOfAccountsListResponseDto> GetAccountsAsync(Guid userId, string? search, string? category)
    {
        var query = _db.ChartOfAccounts.Where(a => a.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            query = query.Where(a => a.AccountName.ToLower().Contains(keyword)
                                  || a.ReferenceNumber.ToString().Contains(keyword));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(a => a.Type == category);
        }

        var loadedAccounts = await query
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var accountIds = loadedAccounts.Select(a => a.Id).ToList();
        var currentPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId)
            ?? await _db.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

        if (currentPeriod == null)
        {
            foreach (var account in loadedAccounts)
            {
                account.Balance = 0;
            }
        }
        else
        {
            var startUtc = currentPeriod.StartDate.Date;
            var endUtc = currentPeriod.EndDate.Date.AddDays(1).AddTicks(-1);

            var accountBalances = await _db.JournalEntryLines
                .Where(j => accountIds.Contains(j.AccountId) &&
                            j.JournalEntry != null &&
                            j.JournalEntry.UserId == userId &&
                            (j.JournalEntry.JournalType == "General" || j.JournalEntry.JournalType == "Adjusting") &&
                            j.JournalEntry.EntryDate >= startUtc &&
                            j.JournalEntry.EntryDate <= endUtc)
                .GroupBy(j => j.AccountId)
                .Select(g => new
                {
                    AccountId = g.Key,
                    TotalDebit = g.Sum(j => j.Debit),
                    TotalCredit = g.Sum(j => j.Credit)
                })
                .ToDictionaryAsync(x => x.AccountId);

            foreach (var account in loadedAccounts)
            {
                if (accountBalances.TryGetValue(account.Id, out var balance))
                {
                    // Lakukan TryParse string 'account.Type' ke enum 'AccountClassification'
                    if (Enum.TryParse<AccountClassification>(account.Type, true, out var classification))
                    {
                        account.Balance = AccountClassificationHelper.NormalBalanceIsDebit(classification)
                            ? balance.TotalDebit - balance.TotalCredit
                            : balance.TotalCredit - balance.TotalDebit;
                    }
                    else
                    {
                        account.Balance = balance.TotalDebit - balance.TotalCredit;
                    }
                }
                else
                {
                    account.Balance = 0;
                }
            }
        }

        var accountsList = loadedAccounts.Select(a => new AccountItemDto
        {
            Id = a.Id,
            ReferenceNumber = a.ReferenceNumber,
            AccountName = a.AccountName,
            Type = a.Type,
            Role = a.Role,
            IsActive = a.IsActive,
            Balance = a.Balance
        });

        return new ChartOfAccountsListResponseDto
        {
            Success = true,
            SelectedPeriodName = currentPeriod?.PeriodName,
            Accounts = accountsList
        };
    }

    public async Task<ServiceResultDto> CreateAccountAsync(Guid userId, CreateAccountRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.AccountName))
            return Fail("Account name is required.", 400);

        if (string.IsNullOrWhiteSpace(request.Type))
            return Fail("Account category type is required.", 400);

        // Convert string category/type ke enum AccountClassification
        if (!Enum.TryParse<AccountClassification>(request.Type, true, out var classification))
        {
            return Fail($"Invalid account classification category '{request.Type}'.", 400);
        }

        // Panggil ValidateReferenceNumber dengan tipe enum AccountClassification (1 argument)
        if (!AccountClassificationHelper.ValidateReferenceNumber(classification))
        {
            return Fail($"Invalid reference number {request.ReferenceNumber} for category {request.Type}.", 400);
        }

        bool isCodeTaken = await _db.ChartOfAccounts
            .AnyAsync(a => a.UserId == userId && a.ReferenceNumber == request.ReferenceNumber);

        if (isCodeTaken)
            return Fail($"Account code {request.ReferenceNumber} is already in use.", 400);

        var newAccount = new ChartOfAccount
        {
            UserId = userId,
            ReferenceNumber = request.ReferenceNumber,
            AccountName = request.AccountName.Trim(),
            Type = request.Type,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Default" : request.Role,
            IsActive = true,
            Balance = 0
        };

        try
        {
            _db.ChartOfAccounts.Add(newAccount);
            await _db.SaveChangesAsync();

            return new ServiceResultDto
            {
                IsSuccess = true,
                Message = $"Account '{newAccount.AccountName}' successfully created.",
                AccountId = newAccount.Id,
                StatusCode = 200
            };
        }
        catch (Exception ex)
        {
            return Fail($"A fatal error occurred while saving the account: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResultDto> UpdateAccountAsync(Guid userId, int accountId, UpdateAccountRequestDto request)
    {
        var account = await _db.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        if (account == null)
            return Fail("Account not found.", 404);

        if (string.IsNullOrWhiteSpace(request.AccountName))
            return Fail("Account name is required.", 400);

        // Convert string category/type ke enum AccountClassification
        if (!Enum.TryParse<AccountClassification>(request.Type, true, out var classification))
        {
            return Fail($"Invalid account classification category '{request.Type}'.", 400);
        }

        // Panggil ValidateReferenceNumber dengan tipe enum AccountClassification (1 argument)
        if (!AccountClassificationHelper.ValidateReferenceNumber(classification))
        {
            return Fail($"Invalid reference number {request.ReferenceNumber} for category {request.Type}.", 400);
        }

        bool isCodeTaken = await _db.ChartOfAccounts
            .AnyAsync(a => a.UserId == userId && a.ReferenceNumber == request.ReferenceNumber && a.Id != accountId);

        if (isCodeTaken)
            return Fail($"Account code {request.ReferenceNumber} is already in use.", 400);

        account.ReferenceNumber = request.ReferenceNumber;
        account.AccountName = request.AccountName.Trim();
        account.Type = request.Type;
        account.Role = string.IsNullOrWhiteSpace(request.Role) ? "Default" : request.Role;
        account.IsActive = request.IsActive;

        try
        {
            await _db.SaveChangesAsync();
            return Success($"Account '{account.AccountName}' successfully updated.");
        }
        catch (Exception ex)
        {
            return Fail($"A fatal error occurred while updating the account: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResultDto> DeleteAccountAsync(Guid userId, int accountId)
    {
        var entity = await _db.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId && a.UserId == userId);

        if (entity == null)
            return Fail("Account not found.", 404);

        bool hasJournalLines = await _db.JournalEntryLines.AnyAsync(l => l.AccountId == accountId);
        if (hasJournalLines)
        {
            return Fail($"Account '{entity.AccountName}' cannot be deleted because it already has journal entries. Set it to Inactive instead.", 400);
        }

        try
        {
            _db.ChartOfAccounts.Remove(entity);
            await _db.SaveChangesAsync();
            return Success($"Account '{entity.AccountName}' successfully deleted.");
        }
        catch (Exception ex)
        {
            return Fail($"A fatal error occurred while deleting the account: {ex.Message}", 500);
        }
    }

    private static ServiceResultDto Success(string message) =>
        new() { IsSuccess = true, Message = message, StatusCode = 200 };

    private static ServiceResultDto Fail(string message, int statusCode) =>
        new() { IsSuccess = false, Message = message, StatusCode = statusCode };
}