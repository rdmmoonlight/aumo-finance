using AumoBackend.DTOs.Core;

namespace AumoBackend.Services.Core;

/// <summary>
/// Layanan logika bisnis untuk I Rust Core Service.
/// </summary>
public interface IRustCoreService
{
    Task<SalamResponse?> GetSalamAsync(CancellationToken ct = default);
}