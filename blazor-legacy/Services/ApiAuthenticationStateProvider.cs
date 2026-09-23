using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Http;

namespace AumoBlazor.Services;

public class ApiAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ApiAuthenticationStateProvider> _logger;

    public ApiAuthenticationStateProvider(
        HttpClient httpClient, 
        IHttpContextAccessor httpContextAccessor,
        ILogger<ApiAuthenticationStateProvider> logger)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "api/v1/auth/me");

            // PERBAIKAN UTAMA: Teruskan Cookie dari HttpContext pengguna ke request HttpClient
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Headers.TryGetValue("Cookie", out var cookieHeader))
            {
                request.Headers.Add("Cookie", cookieHeader.ToString());
            }

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var userProfile = await response.Content.ReadFromJsonAsync<UserProfileResponse>();

                if (userProfile?.Success == true && !string.IsNullOrEmpty(userProfile.Email))
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, userProfile.UserId ?? string.Empty),
                        new Claim(ClaimTypes.Name, userProfile.FullName ?? userProfile.UserName ?? "User"),
                        new Claim(ClaimTypes.Email, userProfile.Email)
                    };

                    if (userProfile.Roles != null)
                    {
                        foreach (var role in userProfile.Roles)
                        {
                            claims.Add(new Claim(ClaimTypes.Role, role));
                        }
                    }

                    // Menandai klaim terautentikasi dengan jenis autentikasi "CookieAuth"
                    var identity = new ClaimsIdentity(claims, "CookieAuth");
                    var user = new ClaimsPrincipal(identity);

                    return new AuthenticationState(user);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal memverifikasi status autentikasi dari backend API.");
        }

        // Kembalikan Anonymous User jika gagal terautentikasi
        return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
    }

    /// <summary>
    /// Dipanggil setelah proses Login / Logout untuk memperbarui UI Blazor secara mendadak.
    /// </summary>
    public void NotifyUserAuthenticationStateChanged()
    {
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public class UserProfileResponse
    {
        public bool Success { get; set; }
        public string? UserId { get; set; }
        public string? Email { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public List<string>? Roles { get; set; }
    }
}
