// backend/Services/Core/RustCoreService.cs
namespace AumoBackend.Services.Core;

using AumoBackend.DTOs.Core;
using System.Net.Http.Json;

public class RustCoreService : IRustCoreService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RustCoreService> _logger;

    public RustCoreService(IHttpClientFactory httpClientFactory, ILogger<RustCoreService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<SalamResponse?> GetSalamAsync(CancellationToken ct = default)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("RustCore");
            var response = await client.GetFromJsonAsync<SalamResponse>("/salam", ct);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal memanggil Rust Core /salam");
            return null;
        }
    }
}
