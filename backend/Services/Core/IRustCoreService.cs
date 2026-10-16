// backend/Services/Core/IRustCoreService.cs
namespace AumoBackend.Services.Core;

using AumoBackend.DTOs.Core;

public interface IRustCoreService
{
    Task<SalamResponse?> GetSalamAsync(CancellationToken ct = default);
}
