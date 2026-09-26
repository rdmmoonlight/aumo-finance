using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using AumoBlazor.Configurations;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.Circuits;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AumoBlazor.Extensions
{
    public class CircuitCookieStore
    {
        private readonly ConcurrentDictionary<string, string> _cookies = new(StringComparer.OrdinalIgnoreCase);

        public void UpdateFromSetCookieHeader(IEnumerable<string> setCookieHeaders)
        {
            foreach (var header in setCookieHeaders)
            {
                var cookiePart = header.Split(';')[0].Trim();
                var eqIdx = cookiePart.IndexOf('=');
                if (eqIdx > 0)
                {
                    var name = cookiePart.Substring(0, eqIdx).Trim();
                    var val = cookiePart.Substring(eqIdx + 1).Trim();
                    if (!string.IsNullOrEmpty(val))
                    {
                        _cookies[name] = val;
                    }
                    else
                    {
                        _cookies.TryRemove(name, out _);
                    }
                }
            }
        }

        public void LoadFromCookieHeader(string? cookieHeader)
        {
            if (string.IsNullOrWhiteSpace(cookieHeader)) return;

            var pairs = cookieHeader.Split(';');
            foreach (var pair in pairs)
            {
                var cookiePart = pair.Trim();
                var eqIdx = cookiePart.IndexOf('=');
                if (eqIdx > 0)
                {
                    var name = cookiePart.Substring(0, eqIdx).Trim();
                    var val = cookiePart.Substring(eqIdx + 1).Trim();
                    _cookies[name] = val;
                }
            }
        }

        public string? GetCookieHeaderString()
        {
            if (_cookies.IsEmpty) return null;
            return string.Join("; ", _cookies.Select(kvp => $"{kvp.Key}={kvp.Value}"));
        }
    }

    public class CookieCircuitHandler : CircuitHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly CircuitCookieStore _cookieStore;

        public CookieCircuitHandler(IHttpContextAccessor httpContextAccessor, CircuitCookieStore cookieStore)
        {
            _httpContextAccessor = httpContextAccessor;
            _cookieStore = cookieStore;
        }

        public override Task OnCircuitOpenedAsync(Circuit circuit, CancellationToken cancellationToken)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Headers.TryGetValue("Cookie", out var cookieHeader))
            {
                _cookieStore.LoadFromCookieHeader(cookieHeader.ToString());
            }
            return base.OnCircuitOpenedAsync(circuit, cancellationToken);
        }
    }

    public class CookieHeaderHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly CircuitCookieStore _cookieStore;

        public CookieHeaderHandler(IHttpContextAccessor httpContextAccessor, CircuitCookieStore cookieStore)
        {
            _httpContextAccessor = httpContextAccessor;
            _cookieStore = cookieStore;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext != null && httpContext.Request.Headers.TryGetValue("Cookie", out var cookieValues))
                {
                    _cookieStore.LoadFromCookieHeader(cookieValues.ToString());
                }
            }
            catch
            {
                // Ignored
            }

            var cookieHeaderString = _cookieStore.GetCookieHeaderString();

            if (!string.IsNullOrWhiteSpace(cookieHeaderString))
            {
                request.Headers.Remove("Cookie");
                request.Headers.TryAddWithoutValidation("Cookie", cookieHeaderString);
            }

            var response = await base.SendAsync(request, cancellationToken);

            if (response.Headers.TryGetValues("Set-Cookie", out var setCookieValues))
            {
                _cookieStore.UpdateFromSetCookieHeader(setCookieValues);

                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext != null && !httpContext.Response.HasStarted)
                {
                    foreach (var cookieHeader in setCookieValues)
                    {
                        httpContext.Response.Headers.Append("Set-Cookie", cookieHeader);
                    }
                }
            }

            return response;
        }
    }

    public class ApiAuthenticationStateProvider : AuthenticationStateProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiAuthenticationStateProvider> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly CircuitCookieStore _cookieStore;

        public ApiAuthenticationStateProvider(
            HttpClient httpClient,
            ILogger<ApiAuthenticationStateProvider> logger,
            IHttpContextAccessor httpContextAccessor,
            CircuitCookieStore cookieStore)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _cookieStore = cookieStore;
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            var anonymousState = new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));

            try
            {
                var cookieHeaderString = _cookieStore.GetCookieHeaderString();

                if (string.IsNullOrWhiteSpace(cookieHeaderString))
                {
                    var rawCookie = _httpContextAccessor.HttpContext?.Request.Headers["Cookie"].ToString();
                    if (!string.IsNullOrWhiteSpace(rawCookie))
                    {
                        _cookieStore.LoadFromCookieHeader(rawCookie);
                        cookieHeaderString = _cookieStore.GetCookieHeaderString();
                    }
                }

                if (string.IsNullOrWhiteSpace(cookieHeaderString))
                {
                    return anonymousState;
                }

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var response = await _httpClient.GetAsync("api/v1/auth/me", cts.Token);

                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync(cts.Token);
                    using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
                    var root = doc.RootElement;

                    bool isSuccess = true;
                    if (root.TryGetProperty("success", out var sProp)) isSuccess = sProp.GetBoolean();
                    else if (root.TryGetProperty("isSuccess", out var isProp)) isSuccess = isProp.GetBoolean();

                    string email = string.Empty;
                    if (root.TryGetProperty("email", out var eProp)) email = eProp.GetString() ?? string.Empty;

                    if (isSuccess && !string.IsNullOrEmpty(email))
                    {
                        string userId = string.Empty;
                        if (root.TryGetProperty("id", out var idProp)) userId = idProp.ToString();
                        else if (root.TryGetProperty("userId", out var uProp)) userId = uProp.ToString();

                        string fullName = string.Empty;
                        if (root.TryGetProperty("fullName", out var fnProp)) fullName = fnProp.GetString() ?? string.Empty;
                        if (string.IsNullOrEmpty(fullName) && root.TryGetProperty("userName", out var unProp)) fullName = unProp.GetString() ?? string.Empty;

                        var claims = new List<Claim>
                        {
                            new Claim(ClaimTypes.NameIdentifier, userId),
                            new Claim(ClaimTypes.Name, string.IsNullOrEmpty(fullName) ? "User" : fullName),
                            new Claim(ClaimTypes.Email, email)
                        };

                        if (root.TryGetProperty("roles", out var rolesProp) && rolesProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            foreach (var role in rolesProp.EnumerateArray())
                            {
                                if (role.GetString() is string rName)
                                    claims.Add(new Claim(ClaimTypes.Role, rName));
                            }
                        }

                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        return new AuthenticationState(new ClaimsPrincipal(identity));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Verifikasi auth di Blazor Circuit mengembalikan anonymous: {Message}", ex.Message);
            }

            return anonymousState;
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

    public class WebApiGuardianService
    {
        private readonly HttpClient _httpClient;

        public WebApiGuardianService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public Task CreateLoginActivityAsync(
            Guid userId,
            string ipAddress,
            string userAgent,
            string deviceType,
            string location,
            string authMethod,
            bool isSuccess,
            string? failureReason = null,
            string? sessionToken = null)
        {
            return Task.CompletedTask;
        }

        public Task CreateSessionAsync(
            Guid userId,
            string sessionToken,
            string ipAddress,
            string userAgent,
            string deviceType,
            string location,
            string deviceName,
            string operatingSystem)
        {
            return Task.CompletedTask;
        }

        public Task RevokeSessionAsync(Guid userId, Guid sessionId)
        {
            return Task.FromResult(true);
        }

        public Task RevokeAllSessionsAsync(Guid userId)
        {
            return Task.FromResult(true);
        }
    }

    public static class AppServiceExtensions
    {
        public static AppConfig AddAppConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            var config = new AppConfig();

            var webApi = configuration["WEB_API_URL"] ?? Environment.GetEnvironmentVariable("WEB_API_URL");
            if (!string.IsNullOrWhiteSpace(webApi))
            {
                config.WebApiUrl = webApi.EndsWith("/") ? webApi : webApi + "/";
            }

            config.AppName = configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? config.AppName;

            config.AuthLoginPath = configuration["AUTH_LOGIN_PATH"] ?? config.AuthLoginPath;
            config.AuthAccessDeniedPath = configuration["AUTH_ACCESS_DENIED_PATH"] ?? config.AuthAccessDeniedPath;

            if (int.TryParse(configuration["AUTH_COOKIE_EXPIRE_DAYS"], out var days))
            {
                config.AuthCookieExpireDays = days;
            }

            config.MarketUserAgent = configuration["MARKET_USER_AGENT"]
                ?? Environment.GetEnvironmentVariable("MARKET_USER_AGENT")
                ?? $"{config.AppName}/1.0";

            services.AddSingleton(config);
            return config;
        }

        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, AppConfig config, Func<HttpRequest, bool> isApiOrBlazorCircuit)
        {
            services.AddDataProtection().SetApplicationName(config.AppName);

            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
                options.Secure = CookieSecurePolicy.Always;
            });

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "AumoFinance.Session";
                    options.LoginPath = config.AuthLoginPath;
                    options.AccessDeniedPath = config.AuthAccessDeniedPath;
                    options.ExpireTimeSpan = TimeSpan.FromDays(config.AuthCookieExpireDays);
                    options.SlidingExpiration = true;
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Lax;

                    options.Events.OnRedirectToLogin = context =>
                    {
                        if (isApiOrBlazorCircuit(context.Request))
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        }
                        else
                        {
                            context.Response.Redirect(context.RedirectUri);
                        }
                        return Task.CompletedTask;
                    };

                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        if (isApiOrBlazorCircuit(context.Request))
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        }
                        else
                        {
                            context.Response.Redirect(context.RedirectUri);
                        }
                        return Task.CompletedTask;
                    };
                });

            services.AddAuthorization();
            services.AddScoped<AuthenticationStateProvider, ApiAuthenticationStateProvider>();
            services.AddCascadingAuthenticationState();

            return services;
        }

        public static IServiceCollection AddHttpAndCircuitServices(this IServiceCollection services, AppConfig config)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<CircuitCookieStore>();
            services.AddScoped<CircuitHandler, CookieCircuitHandler>();
            services.AddTransient<CookieHeaderHandler>();

            services.AddHttpClient("BackendApi", client =>
            {
                client.BaseAddress = new Uri(config.WebApiUrl);
                client.Timeout = TimeSpan.FromSeconds(15);
            })
            .AddHttpMessageHandler<CookieHeaderHandler>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                UseCookies = false
            });

            services.AddScoped(sp =>
            {
                var factory = sp.GetRequiredService<IHttpClientFactory>();
                return factory.CreateClient("BackendApi");
            });

            services.AddHttpClient("MarketApiClient", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(15);
                client.DefaultRequestHeaders.UserAgent.ParseAdd(config.MarketUserAgent);
            });

            return services;
        }
    }
}
