using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Core; // ✅ DITAMBAHKAN: Namespace AppDbContext Anda
using AumoFinance.Components;
using AumoFinance.Models;
using AumoFinance.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore; // ✅ DITAMBAHKAN: Namespace Entity Framework Core
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

            // Menambahkan Environment Variables ke Configuration Pipeline
            builder.Configuration.AddEnvironmentVariables();

            // =====================================
            // 1. DATABASE & EFC CONTEXT FACTORY (SOLUSI TOPBAR ERROR)
            // =====================================
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? builder.Configuration["DATABASE_URL"];

            if (!string.IsNullOrEmpty(connectionString))
            {
                // ✅ DAFTARKAN DbContextFactory UNTUK BLAZOR COMPONENTS (TopBar.razor, dll.)
                builder.Services.AddDbContextFactory<AppDbContext>(options =>
                {
                    // Sesuaikan provider jika bukan PostgreSQL (misal: UseSqlServer)
                    options.UseNpgsql(connectionString);
                });

                // Standard Scoped DbContext jika ada service lain yang membutuhkan
                builder.Services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseNpgsql(connectionString);
                });
            }

            // =====================================
            // 2. WEB API CONFIGURATION & HTTPCLIENT WITH SINGLETON COOKIE CONTAINER
            // =====================================
            var webApiUrl = builder.Configuration["WEB_API_URL"]
                ?? Environment.GetEnvironmentVariable("WEB_API_URL")
                ?? "https://localhost:5001/"; // Fallback URL Backend

            if (!webApiUrl.EndsWith("/"))
            {
                webApiUrl += "/";
            }

            // Shared CookieContainer agar session cookie tersimpan di tingkat circuit/session
            builder.Services.AddSingleton<CookieContainer>();

            // HttpClient for backend API calls (cookie-aware)
            builder.Services.AddScoped(sp =>
            {
                var cookieContainer = sp.GetRequiredService<CookieContainer>();
                var handler = new HttpClientHandler
                {
                    UseCookies = true,
                    CookieContainer = cookieContainer
                };

                return new HttpClient(handler)
                {
                    BaseAddress = new Uri(webApiUrl)
                };
            });

            // =====================================
            // 3. DATA PROTECTION & APP CONFIG
            // =====================================
            var appName = builder.Configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? "AumoFinanceApp";

            builder.Services.AddDataProtection()
                .SetApplicationName(appName);

            // =====================================
            // 4. COOKIE AUTHENTICATION & CUSTOM API BLAZOR AUTH STATE
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
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                });

            builder.Services.AddAuthorization();
            builder.Services.AddHttpContextAccessor();

            // MENGGUNAKAN API AUTHENTICATION STATE PROVIDER KUSTOM
            builder.Services.AddScoped<AuthenticationStateProvider, ApiAuthenticationStateProvider>();
            builder.Services.AddCascadingAuthenticationState();

            // =====================================
            // 5. BLAZOR CORE & CONTROLLERS
            // =====================================
            builder.Services.AddControllers();

            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents();

            // =====================================
            // 6. APPLICATION SERVICES & HEALTH CHECKS
            // =====================================
            builder.Services.AddHealthChecks();
            builder.Services.AddHostedService<RenderKeepAliveService>();

            // --- DECOUPLED SERVICES (HTTP / STUB - NO DIRECT DB DEPENDENCY) ---
            builder.Services.AddScoped<IGuardianService, WebApiGuardianService>();
            builder.Services.AddHttpClient<IAiService, AiService>();
            builder.Services.AddScoped<IJournalImportService, JournalImportService>();
            builder.Services.AddScoped<ITransactionNumberService, TransactionNumberService>();
            builder.Services.AddMemoryCache();
            builder.Services.AddScoped<ICloudStorageService, CloudinaryService>();
            builder.Services.AddScoped<DashboardDataService>();

            // --- MARKET SERVICE SETUP ---
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
            // 7. FORWARDED HEADERS (Reverse Proxy / Render)
            // =====================================
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownIPNetworks.Clear();
                options.KnownProxies.Clear();
            });

            // =====================================
            // BUILD APPLICATION
            // =====================================
            var app = builder.Build();

            // =====================================
            // 8. HTTP PIPELINE MIDDLEWARE & FORWARDED HEADERS
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
            app.UseRouting();
            app.UseAntiforgery();

            app.UseAuthentication();
            app.UseAuthorization();

            // =====================================
            // 9. ENDPOINTS & MAP CONTROLLERS
            // =====================================
            app.MapHealthChecks("/health");

            app.MapControllers();

            app.MapRazorComponents<App>()
                .AddInteractiveServerRenderMode();

            // =====================================
            // 10. RUN APPLICATION
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
    // CUSTOM AUTHENTICATION STATE PROVIDER FOR REST API
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
            var httpContextUser = _httpContextAccessor.HttpContext?.User;
            if (httpContextUser?.Identity?.IsAuthenticated == true)
            {
                return new AuthenticationState(httpContextUser);
            }

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

                        var identity = new ClaimsIdentity(claims, "ApiAuth");
                        var user = new ClaimsPrincipal(identity);

                        return new AuthenticationState(user);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal memverifikasi autentikasi dari backend API.");
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
    // COMPLETE IMPLEMENTATION FOR IGUARDIANSERVICE
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
            return Task.CompletedTask;
        }

        public Task RevokeAllSessionsAsync(Guid userId)
        {
            return Task.CompletedTask;
        }

        public Task<List<LoginActivity>> GetLoginActivitiesAsync(Guid userId)
        {
            return Task.FromResult(new List<LoginActivity>());
        }
    }
}
