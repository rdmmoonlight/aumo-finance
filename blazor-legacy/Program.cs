using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoFinance.Components;
using AumoFinance.Models;
using AumoFinance.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components.Authorization;
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
            // =====================================
            // 0. LOAD LOCAL .ENV FILE (IF EXISTS)
            // =====================================
            LoadDotEnv();

            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration.AddEnvironmentVariables();

            // =====================================
            // 1. FORWARDED HEADERS & HTTPS REDIRECTION (RENDER PROXY)
            // =====================================
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownIPNetworks.Clear();
                options.KnownProxies.Clear();
            });

            builder.Services.AddHttpsRedirection(options =>
            {
                options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
                options.HttpsPort = 443;
            });

            builder.Services.AddHsts(options =>
            {
                options.Preload = true;
                options.IncludeSubDomains = true;
                options.MaxAge = TimeSpan.FromDays(365);
            });

            // =====================================
            // 2. HTTPCLIENT & HTTPCONTEXT ACCESSOR FOR BLAZOR SERVER COOKIES
            // =====================================
            var webApiUrl = builder.Configuration["WEB_API_URL"]
                ?? Environment.GetEnvironmentVariable("WEB_API_URL")
                ?? "https://localhost:5001/";

            if (!webApiUrl.EndsWith("/"))
            {
                webApiUrl += "/";
            }

            builder.Services.AddHttpContextAccessor();

            // Register Custom DelegatingHandler untuk Meneruskan Cookie Browser ke Backend API
            builder.Services.AddTransient<CookieHeaderHandler>();

            // Scoped HttpClient untuk Blazor Server Circuit
            builder.Services.AddScoped(sp =>
            {
                var cookieHandler = sp.GetRequiredService<CookieHeaderHandler>();
                cookieHandler.InnerHandler = new HttpClientHandler
                {
                    UseCookies = false // Matikan kontrol cookie internal agar DelegatingHandler memegang kendali
                };

                return new HttpClient(cookieHandler)
                {
                    BaseAddress = new Uri(webApiUrl)
                };
            });

            // =====================================
            // 3. DATA PROTECTION & COOKIE POLICY
            // =====================================
            var appName = builder.Configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? "AumoFinanceApp";

            builder.Services.AddDataProtection()
                .SetApplicationName(appName);

            builder.Services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.Lax;
                options.Secure = CookieSecurePolicy.Always; // Wajib HTTPS untuk Cross-Site
            });

            // =====================================
            // 4. COOKIE AUTHENTICATION & BLAZOR AUTH STATE
            // =====================================
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

                    // Mencegah redirect HTTP 302 pada request SignalR WebSocket/_blazor dari anonim
                    options.Events.OnRedirectToLogin = context =>
                    {
                        if (context.Request.Path.StartsWithSegments("/_blazor") || context.Request.Path.StartsWithSegments("/api"))
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
                        if (context.Request.Path.StartsWithSegments("/_blazor") || context.Request.Path.StartsWithSegments("/api"))
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

            // Authentication state provider berbasis Cookie / HttpContext User
            builder.Services.AddScoped<AuthenticationStateProvider, ApiAuthenticationStateProvider>();
            builder.Services.AddCascadingAuthenticationState();

            // =====================================
            // 5. BLAZOR CORE & SIGNALR STABILITY
            // =====================================
            builder.Services.AddControllers();

            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents(options =>
                {
                    options.DetailedErrors = builder.Environment.IsDevelopment();
                    options.DisconnectedCircuitRetentionPeriod = TimeSpan.FromMinutes(3);
                });

            // Stabilisasi WebSocket di Render (Mencegah Connection Aborted/Dropped)
            builder.Services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = builder.Environment.IsDevelopment();
                hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(15);
                hubOptions.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
                hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(15);
            });

            // =====================================
            // 6. APPLICATION SERVICES
            // =====================================
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

            // =====================================
            // BUILD APPLICATION
            // =====================================
            var app = builder.Build();

            // =====================================
            // 7. HTTP PIPELINE MIDDLEWARE ORDER
            // =====================================
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
                app.UseHttpsRedirection();

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

            // =====================================
            // 8. ENDPOINTS
            // =====================================
            app.MapHealthChecks("/health");
            app.MapControllers();

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            // =====================================
            // 9. RUN APPLICATION
            // =====================================
            app.Run();
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
    // COOKIE HEADER HANDLER UNTUK HTTPCLIENT
    // =====================================
    public class CookieHeaderHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CookieHeaderHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Headers.TryGetValue("Cookie", out var cookieValues))
            {
                request.Headers.Remove("Cookie");
                request.Headers.Add("Cookie", cookieValues.ToString());
            }

            return base.SendAsync(request, cancellationToken);
        }
    }

    // =====================================
    // AUTHENTICATION STATE PROVIDER UNTUK COOKIES
    // =====================================
    public class ApiAuthenticationStateProvider : AuthenticationStateProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiAuthenticationStateProvider> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApiAuthenticationStateProvider(
            HttpClient httpClient,
            ILogger<ApiAuthenticationStateProvider> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            // 1. Cek terlebih dahulu apakah user terautentikasi langsung via Cookie di HttpContext (Prerendering)
            var httpContextUser = _httpContextAccessor.HttpContext?.User;
            if (httpContextUser?.Identity?.IsAuthenticated == true)
            {
                return new AuthenticationState(httpContextUser);
            }

            // 2. Jika via WebSocket/Blazor Circuit, lakukan verifikasi sesi Cookie ke API
            try
            {
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

                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        var user = new ClaimsPrincipal(identity);

                        return new AuthenticationState(user);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal memverifikasi sesi cookie autentikasi dari backend API.");
            }

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
