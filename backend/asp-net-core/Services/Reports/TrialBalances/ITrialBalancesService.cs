namespace AumoBackend.Services.Reports.TrialBalances;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;

/// <summary>
/// Neraca saldo. Saldo dihitung dari jurnal umum (AppDbContext); hasilnya disimpan sebagai
/// snapshot di tiga tabel terpisah (TrialBalanceUnadjusted, TrialBalanceAdjusted,
/// TrialBalancePostClosing) lewat NeondbContext.
/// </summary>
public interface ITrialBalanceService
{
    /// <summary>reportType: "unadjusted", "adjusted", atau "post-closing".</summary>
    Task<List<TrialBalanceRow>> BuildTrialBalanceRowsAsync(
        Guid userId,
        Period period,
        bool includeAdjusting = false,
        string reportType = "unadjusted");

    Task<decimal> ComputeRetainedEarningsEndingAsync(Guid userId, Period period);

    /// <summary>Mengganti snapshot periode tersebut di tabel sesuai reportType.</summary>
    Task SaveSnapshotAsync(string reportType, Guid userId, Period period, IReadOnlyList<TrialBalanceRow> rows);

    Task<List<TrialBalanceUnadjustedRow>> BuildUnadjustedTrialBalanceAsync(Guid userId, Period period);

    Task<List<TrialBalanceAdjustedRow>> BuildAdjustedTrialBalanceAsync(Guid userId, Period period);

    Task<List<TrialBalancePostClosingRow>> BuildPostClosingTrialBalanceAsync(Guid userId, Period period);
}
