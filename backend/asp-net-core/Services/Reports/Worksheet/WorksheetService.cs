namespace AumoBackend.Services.Reports.Worksheet;

using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.EntityFrameworkCore;

public class WorksheetService : IWorksheetService
{
    private readonly NeondbContext _db;
    private readonly ITrialBalanceService _trialBalanceService;

    public WorksheetService(NeondbContext db, ITrialBalanceService trialBalanceService)
    {
        _db = db;
        _trialBalanceService = trialBalanceService;
    }

    public async Task<WorksheetResponseDto> GetWorksheetAsync(Guid userId)
    {
        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return new WorksheetResponseDto
            {
                Success = true,
                HasPeriodSelected = false,
                Message = "No accounting period selected.",
                Rows = [],
                Totals = WorksheetTotalsDto.Empty
            };
        }

        var rows = await BuildWorksheetRowsAsync(userId, period);
        return new WorksheetResponseDto
        {
            Success = true,
            HasPeriodSelected = true,
            SelectedPeriodName = period.PeriodName,
            Rows = rows.OrderBy(r => r.ReferenceNumber).ToList(),
            Totals = WorksheetTotalsDto.FromRows(rows)
        };
    }

    private async Task<List<WorksheetRowDto>> BuildWorksheetRowsAsync(Guid userId, Period period)
    {
        var unadjusted = await _trialBalanceService.BuildTrialBalanceRowsAsync(_db, userId, period, false);
        var adjusted = await _trialBalanceService.BuildTrialBalanceRowsAsync(_db, userId, period, true);

        var accounts = await _db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .ToDictionaryAsync(a => a.Id);

        var allIds = unadjusted.Select(r => r.AccountId).Union(adjusted.Select(r => r.AccountId));
        var uDict = unadjusted.ToDictionary(x => x.AccountId);
        var aDict = adjusted.ToDictionary(x => x.AccountId);

        var result = new List<WorksheetRowDto>();
        foreach (var id in allIds)
        {
            if (!accounts.TryGetValue(id, out var acc)) continue;
            uDict.TryGetValue(id, out var u);
            aDict.TryGetValue(id, out var a);

            var adjNet = (a?.Debit - a?.Credit ?? 0) - (u?.Debit - u?.Credit ?? 0);

            result.Add(new WorksheetRowDto
            {
                AccountId = id,
                ReferenceNumber = acc.ReferenceNumber,
                AccountName = acc.AccountName,
                Type = acc.Type,
                NormalBalanceIsDebit = AccountClassificationHelper.NormalBalanceIsDebit(acc.Type),
                UnadjustedDebit = u?.Debit ?? 0,
                UnadjustedCredit = u?.Credit ?? 0,
                AdjustmentDebit = adjNet > 0 ? adjNet : 0,
                AdjustmentCredit = adjNet < 0 ? -adjNet : 0,
                AdjustedDebit = a?.Debit ?? 0,
                AdjustedCredit = a?.Credit ?? 0,
                IncomeStatementDebit = AccountClassificationHelper.IsTemporary(acc.Type) ? a?.Debit ?? 0 : 0,
                IncomeStatementCredit = AccountClassificationHelper.IsTemporary(acc.Type) ? a?.Credit ?? 0 : 0,
                FinancialPositionDebit = !AccountClassificationHelper.IsTemporary(acc.Type) ? a?.Debit ?? 0 : 0,
                FinancialPositionCredit = !AccountClassificationHelper.IsTemporary(acc.Type) ? a?.Credit ?? 0 : 0,
            });
        }
        return result;
    }
}