namespace AumoBackend.Services.Reports.TrialBalances;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

public interface ITrialBalancesService
{
    /// <summary>Periode yang sedang dipilih pengguna, atau null bila belum ada.</summary>
    Task<Period?> ResolveSelectedPeriodAsync(Guid userId);

    Task<List<TrialBalancesRow>> BuildTrialBalancesRowsAsync(
        Guid userId,
        Period period,
        bool includeAdjusting = false,
        string reportType = "unadjusted");

    Task<decimal> ComputeRetainedEarningsEndingAsync(Guid userId, Period period);

    /// <summary>Mengganti snapshot periode tersebut di tabel sesuai reportType.</summary>
    Task SaveSnapshotAsync(string reportType, Guid userId, Period period, IReadOnlyList<TrialBalancesRow> rows);

    Task<List<UnadjustedTrialBalanceRow>> BuildUnadjustedTrialBalanceAsync(Guid userId, Period period);

    Task<List<AdjustedTrialBalanceRow>> BuildAdjustedTrialBalanceAsync(Guid userId, Period period);

    Task<List<PostClosingTrialBalanceRow>> BuildPostClosingTrialBalanceAsync(Guid userId, Period period);
}
