using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Reports.GeneralLedgers;

public interface IGeneralLedgersService
{
    /// <summary>
    /// Memperbarui/meregenerasi data pada tabel Permanent & Temporary General Ledgers
    /// berdasarkan periode yang sedang dipilih (IsSelected == true).
    /// </summary>
    Task<BaseServiceResult> RefreshGeneralLedgersAsync(Guid userId);

    /// <summary>
    /// Menghapus seluruh data staging General Ledgers untuk periode aktif.
    /// </summary>
    Task<BaseServiceResult> ClearSelectedPeriodLedgersAsync(Guid userId);
}
