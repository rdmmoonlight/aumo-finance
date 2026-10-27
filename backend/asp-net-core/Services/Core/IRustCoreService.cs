using AumoBackend.DTOs.Core;

namespace AumoBackend.Services.Core;

public interface IRustCoreService
{
    Task<SalamResponse?> GetSalamAsync(CancellationToken ct = default);
}
