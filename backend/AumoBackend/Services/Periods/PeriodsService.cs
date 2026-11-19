namespace AumoBackend.Services.Periods;

using System.Globalization;
using AumoBackend.Data;
using AumoBackend.Domain;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.EntityFrameworkCore;

public partial class PeriodsService : IPeriodsService
{
    private readonly AppDbContext db;
    private readonly ITransactionNumberService txNumberService;
    private readonly IGeneralLedgersService glService;

    public PeriodsService(
        AppDbContext db,
        ITransactionNumberService txNumberService,
        IGeneralLedgersService glService)
    {
        this.db = db;
        this.txNumberService = txNumberService;
        this.glService = glService;
    }

    public async Task<GetPeriodsResponse> GetPeriodsAsync(Guid userId)
    {
        var periods = await this.db.Periods
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.StartDate)
            .Select(p => new PeriodDto
            {
                Id = p.Id,
                PeriodName = p.PeriodName,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                IsClosed = p.IsClosed,
                IsSelected = p.IsSelected,
            })
            .ToListAsync();

        var selectedPeriod = periods.FirstOrDefault(p => p.IsSelected);
        int? selectedPeriodId = selectedPeriod?.Id;

        if (!selectedPeriodId.HasValue)
        {
            var selectedFromHelper = await SelectedPeriodHelper.GetSelectedPeriodAsync(this.db, userId);
            selectedPeriodId = selectedFromHelper?.Id;
        }

        if (selectedPeriodId.HasValue)
        {
            foreach (var period in periods)
            {
                period.IsSelected = period.Id == selectedPeriodId.Value;
            }
        }

        return new GetPeriodsResponse
        {
            Success = true,
            SelectedPeriodId = selectedPeriodId,
            Periods = periods,
        };
    }

    public async Task<OpenPeriodInfoResponse> GetOpenPeriodInfoAsync(Guid userId)
    {
        var accounts = await this.db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var permanentAccounts = accounts
            .Where(a => AccountType.IsPermanent(a.Type))
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel,
            })
            .ToList();

        var availableCashAndBank = accounts.Where(a => a.Role == "CashAndEquivalents")
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel,
            })
            .ToList();

        var availableRetainedEarnings = accounts.Where(a => a.Role == "RetainedEarnings")
            .Select(a => new AccountSimpleDto
            {
                Id = a.Id,
                ReferenceNumber = a.ReferenceNumber,
                AccountName = a.AccountName,
                Type = a.Type,
                DisplayLabel = a.DisplayLabel,
            })
            .ToList();

        var hasExistingPermanentAccounts = availableCashAndBank.Count > 0 && availableRetainedEarnings.Count > 0;

        return new OpenPeriodInfoResponse
        {
            Success = true,
            HasExistingPermanentAccounts = hasExistingPermanentAccounts,
            AvailableCashAndBankAccounts = availableCashAndBank,
            AvailableRetainedEarningsAccounts = availableRetainedEarnings,
            PermanentAccounts = permanentAccounts,
        };
    }
}
