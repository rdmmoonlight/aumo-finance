namespace AumoBackend.Services.Reports.TrialBalances;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

public class TrialBalancesService : ITrialBalanceService, ITrialBalancesService
{
    public async Task<List<TrialBalanceRowDto>> BuildTrialBalanceRowsAsync(NeondbContext db, Guid userId, Period period, bool includeAdjusting)
    {
        if (includeAdjusting)
        {
            var adj = await BuildAdjustedTrialBalanceAsync(db, userId, period);
            return adj.Select(x => new TrialBalanceRowDto { AccountId = x.AccountId, Debit = x.Debit, Credit = x.Credit }).ToList();
        }
        else
        {
            var unadj = await BuildUnadjustedTrialBalanceAsync(db, userId, period);
            return unadj.Select(x => new TrialBalanceRowDto { AccountId = x.AccountId, Debit = x.Debit, Credit = x.Credit }).ToList();
        }
    }

    public Task<List<TrialBalanceUnadjustedRow>> BuildUnadjustedTrialBalanceAsync(NeondbContext db, Guid userId, Period period)
    {
        // TODO: isi logic lama lu disini
        return Task.FromResult(new List<TrialBalanceUnadjustedRow>());
    }

    public Task<List<TrialBalanceAdjustedRow>> BuildAdjustedTrialBalanceAsync(NeondbContext db, Guid userId, Period period)
    {
        return Task.FromResult(new List<TrialBalanceAdjustedRow>());
    }

    public Task<List<TrialBalancePostClosingRow>> BuildPostClosingTrialBalanceAsync(NeondbContext db, Guid userId, Period period)
    {
        return Task.FromResult(new List<TrialBalancePostClosingRow>());
    }

    public Task<decimal> ComputeRetainedEarningsEndingAsync(NeondbContext db, Guid userId, Period period)
    {
        return Task.FromResult(0m);
    }
}