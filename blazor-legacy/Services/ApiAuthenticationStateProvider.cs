using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace AumoBlazor.Services;

public class ApiAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ApiAuthenticationStateProvider> _logger;

    // Nama cookie auth session aplikasi kamu (sesuaikan jika berbeda di backend)
    private const string AuthCookieName = "AumoFinance.Session"; 

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
        var anonymous = new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));

        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            // 1. CEK COOKIE DULU: Jika HttpContext null atau tidak membawa cookie auth, kembalikan Anonymous.
            // Ini MENCEGAH spam request ke /api/v1/auth/me yang memicu respon 401 Unauthorized terus-menerus.
            if (httpContext == null || !httpContext.Request.Headers.TryGetValue("Cookie", out var cookieHeader))
            {
                return anonymous;
            }

            var cookieString = cookieHeader.ToString();
            if (string.IsNullOrWhiteSpace(cookieString) || !cookieString.Contains(AuthCookieName))
            {
                return anonymous;
            }

            // 2. Kirim Request GET ke Backend dengan melampirkan Cookie
            using var request = new HttpRequestMessage(HttpMethod.Get, "api/v1/auth/me");
            request.Headers.TryAddWithoutValidation("Cookie", cookieString);

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

                    // Buat ClaimsIdentity dengan AuthType "CookieAuth"
                    var identity = new ClaimsIdentity(claims, "CookieAuth");
                    var user = new ClaimsPrincipal(identity);

                    return new AuthenticationState(user);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal memverifikasi Cookie Auth dari backend API.");
        }

        return anonymous;
    }

    /// <summary>
    /// Dipanggil untuk memperbarui status autentikasi di seluruh komponen UI Blazor.
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
