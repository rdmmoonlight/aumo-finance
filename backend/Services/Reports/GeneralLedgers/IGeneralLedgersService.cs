using AumoBackend.DTOs;
using AumoBackend.DTOs.Reports;

namespace AumoBackend.Services.Reports.GeneralLedgers;

public interface IGeneralLedgersService
{
    Task<BaseServiceResult> RefreshGeneralLedgersAsync(Guid userId);
    Task<BaseServiceResult> ClearSelectedPeriodLedgersAsync(Guid userId);

    // Baru - semua bisnis GET pindah kesini
    Task<BaseServiceResult<PermanentLedgerGroupedResponse>> GetPermanentLedgersAsync(Guid userId);
    Task<BaseServiceResult<TemporaryLedgerGroupedResponse>> GetTemporaryLedgersAsync(Guid userId);
}

// Kalau BaseServiceResult kamu belum generic, tambahkan ini:
public class BaseServiceResult<T> : BaseServiceResult
{
    public T? Data { get; set; }
}
