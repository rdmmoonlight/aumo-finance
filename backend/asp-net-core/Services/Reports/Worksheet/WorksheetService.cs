namespace AumoBackend.Services.Reports.Worksheet;

using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.EntityFrameworkCore;

public class WorksheetService : IWorksheetService
{
    private readonly AppDbContext _db;
    private readonly ITrialBalancesService _trialBalancesService;

    public WorksheetService(AppDbContext db, ITrialBalancesService trialBalancesService)
    {
        _db = db;
        _trialBalancesService = trialBalancesService;
    }

    public async Task<WorksheetResult> GetWorksheetAsync(Guid userId)
    {
        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return new WorksheetResult { HasPeriodSelected = false };
        }

        var unadjusted = await _trialBalancesService.BuildTrialBalancesRowsAsync(userId, period, false, "unadjusted");
        var adjusted = await _trialBalancesService.BuildTrialBalancesRowsAsync(userId, period, true, "adjusted");

        // Mengambil ChartOfAccounts ber-key Guid
        var accounts = await _db.ChartOfAccounts
            .AsNoTracking()
            .Where(a => a.IsActive && a.UserId == userId)
            .ToDictionaryAsync(a => a.Id); // a.Id pastikan bertipe Guid

        var unadjustedById = unadjusted.ToDictionary(r => r.AccountId); // r.AccountId bertipe Guid
        var adjustedById = adjusted.ToDictionary(r => r.AccountId);   // r.AccountId bertipe Guid

        var rows = new List<WorksheetRowApiResponse>();
        foreach (var accountId in unadjustedById.Keys.Union(adjustedById.Keys))
        {
            if (!accounts.TryGetValue(accountId.GetHashCode(), out var account))
            {
                continue;
            }

            unadjustedById.TryGetValue(accountId, out var u);
            adjustedById.TryGetValue(accountId, out var a);

            var uDebit = u?.Debit ?? 0m;
            var uCredit = u?.Credit ?? 0m;
            var aDebit = a?.Debit ?? 0m;
            var aCredit = a?.Credit ?? 0m;

            // Kolom penyesuaian = selisih saldo neto sesudah dan sebelum jurnal penyesuaian.
            var adjNet = (aDebit - aCredit) - (uDebit - uCredit);

            var row = new WorksheetRowApiResponse
            {
                AccountId = accountId.GetHashCode(),
                ReferenceNumber = account.ReferenceNumber,
                AccountName = account.AccountName,
                Type = account.Type,
                NormalBalanceIsDebit = AccountClassificationHelper.NormalBalanceIsDebit(account.Type),
                UnadjustedDebit = uDebit,
                UnadjustedCredit = uCredit,
                AdjustmentDebit = adjNet > 0m ? adjNet : 0m,
                AdjustmentCredit = adjNet < 0m ? -adjNet : 0m,
                AdjustedDebit = aDebit,
                AdjustedCredit = aCredit,
            };

            // Akun temporer masuk Laba Rugi, akun permanen masuk Posisi Keuangan.
            if (AccountClassificationHelper.IsTemporary(account.Type))
            {
                row.IncomeStatementDebit = aDebit;
                row.IncomeStatementCredit = aCredit;
            }
            else
            {
                row.FinancialPositionDebit = aDebit;
                row.FinancialPositionCredit = aCredit;
            }

            rows.Add(row);
        }

        rows = rows.OrderBy(r => r.ReferenceNumber).ToList();

        var totals = new WorksheetTotalsApiResponse
        {
            UnadjustedDebit = rows.Sum(r => r.UnadjustedDebit),
            UnadjustedCredit = rows.Sum(r => r.UnadjustedCredit),
            AdjustmentDebit = rows.Sum(r => r.AdjustmentDebit),
            AdjustmentCredit = rows.Sum(r => r.AdjustmentCredit),
            AdjustedDebit = rows.Sum(r => r.AdjustedDebit),
            AdjustedCredit = rows.Sum(r => r.AdjustedCredit),
            IncomeStatementDebit = rows.Sum(r => r.IncomeStatementDebit),
            IncomeStatementCredit = rows.Sum(r => r.IncomeStatementCredit),
            FinancialPositionDebit = rows.Sum(r => r.FinancialPositionDebit),
            FinancialPositionCredit = rows.Sum(r => r.FinancialPositionCredit),
        };
        totals.NetIncome = totals.IncomeStatementCredit - totals.IncomeStatementDebit;

        return new WorksheetResult
        {
            HasPeriodSelected = true,
            SelectedPeriodName = period.PeriodName,
            Rows = rows,
            Totals = totals,
        };
    }
}