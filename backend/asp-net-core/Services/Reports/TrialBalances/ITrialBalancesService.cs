namespace AumoBackend.Services.Reports.TrialBalances;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models; // NeondbContext ada disini

public interface ITrialBalanceService
{
    Task<List<TrialBalanceRowDto>> BuildTrialBalanceRowsAsync(NeondbContext db, Guid userId, Period period, bool includeAdjusting);
    Task<List<TrialBalanceUnadjustedRow>> BuildUnadjustedTrialBalanceAsync(NeondbContext db, Guid userId, Period period);
    Task<List<TrialBalanceAdjustedRow>> BuildAdjustedTrialBalanceAsync(NeondbContext db, Guid userId, Period period);
    Task<List<TrialBalancePostClosingRow>> BuildPostClosingTrialBalanceAsync(NeondbContext db, Guid userId, Period period);
    Task<decimal> ComputeRetainedEarningsEndingAsync(NeondbContext db, Guid userId, Period period);
}

// Alias biar controller lama yang masih pakai plural gak error
[Obsolete("Use ITrialBalanceService")]
public interface ITrialBalancesService : ITrialBalanceService { }