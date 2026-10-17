using System.Runtime.InteropServices;
using System.Text.Json;
using AumoBackend.DTOs.Core;

namespace AumoBackend.Services.Core;

public partial class RustCoreService : IRustCoreService
{
    private readonly ILogger<RustCoreService> _logger;

    // Menghubungkan langsung ke Shared Library Rust (aumo_core.so di Linux / aumo_core.dll di Windows)
    [LibraryImport("aumo_core", EntryPoint = "get_salam")]
    private static partial IntPtr NativeGetSalam();

    [LibraryImport("aumo_core", EntryPoint = "free_string")]
    private static partial void NativeFreeString(IntPtr ptr);

    public RustCoreService(ILogger<RustCoreService> logger)
    {
        _logger = logger;
    }

    public Task<SalamResponse?> GetSalamAsync(CancellationToken ct = default)
    {
        try
        {
            IntPtr ptr = NativeGetSalam();
            if (ptr == IntPtr.Zero)
            {
                return Task.FromResult<SalamResponse?>(null);
            }

            string? json = Marshal.PtrToStringAnsi(ptr);
            NativeFreeString(ptr); // Bebaskan memori Rust

            if (string.IsNullOrEmpty(json))
            {
                return Task.FromResult<SalamResponse?>(null);
            }

            var result = JsonSerializer.Deserialize<SalamResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return Task.FromResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RUST FFI] Gagal memanggil fungsi native get_salam");
            return Task.FromResult<SalamResponse?>(null);
        }
    }
}
