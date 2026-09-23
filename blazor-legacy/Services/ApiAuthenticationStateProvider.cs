using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;

namespace AumoBlazor.Services;

public class ApiAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ApiAuthenticationStateProvider> _logger;

    public ApiAuthenticationStateProvider(HttpClient httpClient, ILogger<ApiAuthenticationStateProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        try
        {
            // Memanggil endpoint rujukan backend: /api/v1/auth/me
            var response = await _httpClient.GetAsync("api/v1/auth/me");

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

                    var identity = new ClaimsIdentity(claims, "ApiAuth");
                    var user = new ClaimsPrincipal(identity);

                    return new AuthenticationState(user);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal memverifikasi status autentikasi dari backend.");
        }

        // Return Anonymous jika gagal
        return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
    }

    public void NotifyAuthenticationStateChanged()
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
