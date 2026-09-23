using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AumoFinance.Components;
using AumoFinance.Models;
using AumoFinance.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server;
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

            // Menambahkan Environment Variables ke Configuration Pipeline
            builder.Configuration.AddEnvironmentVariables();

            // =====================================
            // 1. WEB API CONFIGURATION (HTTPS DEFAULT)
            // =====================================
            var webApiUrl = builder.Configuration["WEB_API_URL"]
                ?? Environment.GetEnvironmentVariable("WEB_API_URL")
                ?? "https://localhost:5001/"; // Fallback HTTPS lokal

            if (!webApiUrl.EndsWith("/"))
            {
                webApiUrl += "/";
            }

            // Register HttpClient terpusat yang mendukung Cookies & Credentials ke Backend API
            builder.Services.AddScoped(sp =>
            {
                var handler = new HttpClientHandler
                {
                    UseCookies = true,
                    CookieContainer = new CookieContainer()
                };

                return new HttpClient(handler)
                {
                    BaseAddress = new Uri(webApiUrl)
                };
            });

            // =====================================
            // 2. DATA PROTECTION & APP CONFIG
            // =====================================
            var appName = builder.Configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? "AumoFinanceApp";

            builder.Services.AddDataProtection()
                .SetApplicationName(appName);

            // =====================================
            // 3. COOKIE AUTHENTICATION & BLAZOR AUTH STATE
            // =====================================
            var loginPath = builder.Configuration["AUTH_LOGIN_PATH"] ?? "/auth/login";
            var accessDeniedPath = builder.Configuration["AUTH_ACCESS_DENIED_PATH"] ?? "/auth/login";
            var expireDays = int.TryParse(builder.Configuration["AUTH_COOKIE_EXPIRE_DAYS"], out var days) ? days : 30;

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = loginPath;
                    options.AccessDeniedPath = accessDeniedPath;
                    options.ExpireTimeSpan = TimeSpan.FromDays(expireDays);
                    options.SlidingExpiration = true;
                    options.Cookie.Name = $"{appName}.Session";
                    options.Cookie.HttpOnly = true;
                    // Flexible Secure Policy untuk Dev (HTTP) & Production (HTTPS)
                    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() 
                        ? CookieSecurePolicy.SameAsRequest 
                        : CookieSecurePolicy.Always;
                });

            builder.Services.AddAuthorization();

            // Register AuthenticationStateProvider wajib untuk Blazor Server
            builder.Services.AddScoped<AuthenticationStateProvider, ServerAuthenticationStateProvider>();
            builder.Services.AddCascadingAuthenticationState();

            // =====================================
            // 4. BLAZOR CORE & CONTROLLERS
            // =====================================
            builder.Services.AddControllers();

            builder.Services.AddRazorComponents()
                .AddInteractiveServerComponents();

            // =====================================
            // 5. APPLICATION SERVICES & HEALTH CHECKS
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
            // 6. FORWARDED HEADERS (Reverse Proxy / Render)
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
            // 7. HTTP PIPELINE MIDDLEWARE
            // =====================================
            app.UseForwardedHeaders();

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
                app.UseHttpsRedirection(); // Paksa HTTPS di cloud deployment

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
            // 8. ENDPOINTS & MAP CONTROLLERS
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

        /// <summary>
        /// Pembaca file .env lokal tanpa ketergantungan library luar
        /// </summary>
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
