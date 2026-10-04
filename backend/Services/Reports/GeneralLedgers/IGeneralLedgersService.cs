using AumoBackend.DTOs;

namespace AumoBackend.Services.Reports.GeneralLedgers;

public interface IGeneralLedgersService
{
    /// <summary>
    /// Memperbarui atau meregenerasi data pada staging table PermanentAccountsGeneralLedger 
    /// dan TemporaryAccountsGeneralLedger berdasarkan periode yang sedang dipilih (IsSelected == true).
    /// </summary>
    /// <param name="userId">ID unik pengguna.</param>
    /// <returns>Objek <see cref="BaseServiceResult"/> yang mengindikasikan status keberhasilan proses regenerasi.</returns>
    Task<BaseServiceResult> RefreshGeneralLedgersAsync(Guid userId);

    /// <summary>
    /// Menghapus seluruh data staging General Ledger (Permanent & Temporary) milik user untuk periode aktif.
    /// </summary>
    /// <param name="userId">ID unik pengguna.</param>
    /// <returns>Objek <see cref="BaseServiceResult"/> yang mengindikasikan status keberhasilan proses penghapusan.</returns>
    Task<BaseServiceResult> ClearSelectedPeriodLedgersAsync(Guid userId);
}
