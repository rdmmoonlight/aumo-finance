using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using AumoFinance.Components;
using AumoFinance.Models;
using AumoFinance.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.Circuits;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AumoBlazor
{
    public class Program
    {
        public static void Main(string[] args)
        {
            LoadDotEnv();

            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration.AddEnvironmentVariables();

            // 1. FORWARDED HEADERS & HTTPS REDIRECTION (RENDER PROXY)
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownIPNetworks.Clear();
                options.KnownProxies.Clear();
            });

            builder.Services.AddHsts(options =>
            {
                options.Preload = true;
                options.IncludeSubDomains = true;
                options.MaxAge = TimeSpan.FromDays(365);
            });

            // 2. HTTPCLIENT & HTTPCONTEXT ACCESSOR
            var webApiUrl = builder.Configuration["WEB_API_URL"]
                ?? Environment.GetEnvironmentVariable("WEB_API_URL")
                ?? "http://localhost:5000/";

            if (!webApiUrl.EndsWith("/"))
            {
                webApiUrl += "/";
            }

            builder.Services.AddHttpContextAccessor();

            // CircuitCookieStore (Scoped per User Blazor Circuit)
            builder.Services.AddScoped<CircuitCookieStore>();
            builder.Services.AddScoped<CircuitHandler, CookieCircuitHandler>();
            builder.Services.AddTransient<CookieHeaderHandler>();

            // Scoped HttpClient untuk Blazor Server Circuit
            builder.Services.AddHttpClient("BackendApi", client =>
            {
                client.BaseAddress = new Uri(webApiUrl);
                client.Timeout = TimeSpan.FromSeconds(15);
            })
            .AddHttpMessageHandler<CookieHeaderHandler>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                UseCookies = false // Nonaktifkan internal CookieContainer handler agar tidak bentrok dengan CookieHeaderHandler
            });

            builder.Services.AddScoped(sp =>
            {
                var factory = sp.GetRequiredService<IHttpClientFactory>();
                return factory.CreateClient("BackendApi");
            });

            // 3. DATA PROTECTION & COOKIE POLICY
            var appName = builder.Configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? "AumoFinanceApp";

            builder.Services.AddDataProtection()
                .SetApplicationName(appName);

            builder.Services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
                options.Secure = CookieSecurePolicy.Always;
            });

            // 4. COOKIE AUTHENTICATION & BLAZOR AUTH STATE
            var loginPath = builder.Configuration["AUTH_LOGIN_PATH"] ?? "/auth/login";
            var accessDeniedPath = builder.Configuration["AUTH_ACCESS_DENIED_PATH"] ?? "/auth/login";
            var expireDays = int.TryParse(builder.Configuration["AUTH_COOKIE_EXPIRE_DAYS"], out var days) ? days : 30;

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "AumoFinance.Session";
                    options.LoginPath = loginPath;
                    options.AccessDeniedPath = accessDeniedPath;
                    options.ExpireTimeSpan = TimeSpan.FromDays(expireDays);
                    options.SlidingExpiration = true;
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Lax;

                    options.Events.OnRedirectToLogin = context =>
                    {
                        if (IsApiOrBlazorCircuitRequest(context.Request))
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
                        if (IsApiOrBlazorCircuitRequest(context.Request))
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

            builder.Services.AddAuthorization();

            builder.Services.AddScoped<AuthenticationStateProvider, ApiAuthenticationStateProvider>();
            builder.Services.AddCascadingAuthenticationState();

            // 5. BLAZOR CORE & SIGNALR STABILITY
            builder.Services.AddControllers();

            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents(options =>
                {
                    options.DetailedErrors = builder.Environment.IsDevelopment();
                    options.DisconnectedCircuitRetentionPeriod = TimeSpan.FromMinutes(3);
                });

            builder.Services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = builder.Environment.IsDevelopment();
                hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(15);
                hubOptions.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
                hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(15);
            });

            // 6. APPLICATION SERVICES
            builder.Services.AddHealthChecks();
            builder.Services.AddHostedService<RenderKeepAliveService>();

            builder.Services.AddScoped<IGuardianService, WebApiGuardianService>();
            builder.Services.AddHttpClient<IAiService, AiService>();
            builder.Services.AddScoped<IJournalImportService, JournalImportService>();
            builder.Services.AddScoped<ITransactionNumberService, TransactionNumberService>();
            builder.Services.AddMemoryCache();
            builder.Services.AddScoped<ICloudStorageService, CloudinaryService>();
            builder.Services.AddScoped<DashboardDataService>();

            var marketUserAgent = builder.Configuration["MARKET_USER_AGENT"]
                ?? Environment.GetEnvironmentVariable("MARKET_USER_AGENT")
                ?? $"{appName}/1.0";

            builder.Services.AddHttpClient("MarketApiClient", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(15);
                client.DefaultRequestHeaders.UserAgent.ParseAdd(marketUserAgent);
            });

            builder.Services.AddScoped<IMarketService, MarketService>();

            var app = builder.Build();

            // 7. HTTP PIPELINE MIDDLEWARE ORDER
            app.UseForwardedHeaders();

            app.Use(async (context, next) =>
            {
                if (context.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && proto == "https")
                {
                    context.Request.Scheme = "https";
                }
                await next();
            });

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();

                app.Use(async (context, next) =>
                {
                    try
                    {
                        await next();
                    }
                    catch (Exception ex)
                    {
                        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                        logger.LogError(ex, "Unhandled exception on {Path}", context.Request.Path);

                        if (!context.Response.HasStarted)
                        {
                            context.Response.Clear();
                            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsJsonAsync(new
                            {
                                success = false,
                                message = "Terjadi kesalahan di server. Coba lagi beberapa saat lagi."
                            });
                        }
                    }
                });
            }

            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseRouting();
            app.UseAntiforgery();

            app.UseAuthentication();
            app.UseAuthorization();

            // 8. ENDPOINTS
            app.MapHealthChecks("/health");
            app.MapControllers();

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            app.Run();
        }

        private static bool IsApiOrBlazorCircuitRequest(HttpRequest request)
        {
            return request.Path.StartsWithSegments("/_blazor") ||
                   request.Path.StartsWithSegments("/api") ||
                   request.Headers["X-Requested-With"] == "XMLHttpRequest";
        }

        private static void LoadDotEnv()
        {
            var pathsToTry = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), ".env"),
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ".env"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", ".env")
            };

            string? filePath = pathsToTry.FirstOrDefault(File.Exists);

            if (filePath == null)
                return;

            foreach (var line in File.ReadAllLines(filePath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#"))
                    continue;

                var parts = trimmed.Split('=', 2);
                if (parts.Length != 2)
                    continue;

                var key = parts[0].Trim();
                var value = parts[1].Trim().Trim('"', '\'');

                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, value);
                }
            }
        }
    }

    // =====================================
    // SCOPED CIRCUIT COOKIE STORE
    // =====================================
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

    // =====================================
    // CIRCUIT HANDLER TO CAPTURE COOKIE AT CONNECTION TIME
    // =====================================
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

    // =====================================
    // REVISED COOKIE HEADER HANDLER
    // =====================================
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
            // Update store dari HttpContext jika tersedia
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

            // Tangkap Set-Cookie dari API Response (misal dari /login)
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

    // =====================================
    // SAFE AUTHENTICATION STATE PROVIDER
    // =====================================
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
                // 1. Ambil Cookie yang tersimpan
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

                // Jika TIDAK ADA cookie sama sekali, kembalikan Anonymous tanpa spam request ke API
                if (string.IsNullOrWhiteSpace(cookieHeaderString))
                {
                    return anonymousState;
                }

                // 2. Verifikasi sesi Cookie ke API Backend
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var response = await _httpClient.GetAsync("api/v1/auth/me", cts.Token);

                if (response.IsSuccessStatusCode)
                {
                    var userProfile = await response.Content.ReadFromJsonAsync<UserProfileResponse>(cancellationToken: cts.Token);

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

                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        var user = new ClaimsPrincipal(identity);

                        return new AuthenticationState(user);
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

    // =====================================
    // GUARDIAN SERVICE IMPLEMENTATION
    // =====================================
    public class WebApiGuardianService : IGuardianService
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

        public Task<List<UserSession>> GetActiveSessionsAsync(Guid userId)
        {
            return Task.FromResult(new List<UserSession>());
        }

        public Task RevokeSessionAsync(Guid userId, Guid sessionId)
        {
            return Task.FromResult(true);
        }

        public Task RevokeAllSessionsAsync(Guid userId)
        {
            return Task.FromResult(true);
        }

        public Task<List<LoginActivity>> GetLoginActivitiesAsync(Guid userId)
        {
            return Task.FromResult(new List<LoginActivity>());
        }
    }
}
