namespace AumoBackend.Services.Health;

using AumoBackend.DTOs;

public interface IHealthService
{
    Task<HealthStatusDto> GetHealthStatusAsync();

    /// <summary>Memeriksa koneksi ke database. Pengecualian koneksi diteruskan ke pemanggil.</summary>
    Task<bool> CanConnectToDatabaseAsync();
}
