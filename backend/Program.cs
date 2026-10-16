// <copyright file="Program.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend
{
    using System.Security.Claims;
    using System.Text;
    using System.Threading.RateLimiting;
    using AumoBackend.Data;
    using AumoBackend.Helpers;
    using AumoBackend.Models;
    using AumoBackend.Services;
    using AumoBackend.Services.Auth;
    using AumoBackend.Services.Identity;
    using AumoBackend.Services.JournalEntries;
    using AumoBackend.Services.Settings;
    using FluentValidation;
    using Hangfire;
    using Hangfire.Dashboard;
    using Hangfire.PostgreSql;
    using Microsoft.AspNetCore.Authentication.Google;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.DataProtection;
    using Microsoft.AspNetCore.HttpOverrides;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using Scalar.AspNetCore;
    using Serilog;

    public class Program
    {
        public static async Task Main(string[] args)
        {
            // Konfigurasi awal Serilog untuk mencatat proses bootstrap/startup
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .CreateBootstrapLogger();

            try
            {
                Log.Information("Starting AumoBackend web application...");

                var builder = WebApplication.CreateBuilder(args);

                // Beritahu Host untuk menggunakan Serilog sebagai Logging Provider
                builder.Host.UseSerilog((context, services, configuration) => configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext()
                    .WriteTo.Console());

                // =====================================
                // 0. HTTP CLIENT REGISTRATION
                // =====================================
                builder.Services.AddHttpClient();

                // =====================================
                // 1. DATABASE CONFIGURATION (PostgreSQL - Neon DB Resilient Setup)
                // =====================================
                var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    throw new InvalidOperationException("Database connection string 'DefaultConnection' is missing.");
                }

                builder.Services.AddDbContextFactory<AppDbContext>(options =>
                {
                    options.UseNpgsql(connectionString, npgsqlOptions =>
                    {
                        // Resiliency: Mencegah kegagalan koneksi akibat cold start atau glitch di Neon DB
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorCodesToAdd: null);

                        npgsqlOptions.CommandTimeout(30);
                    });

                    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
                });

                builder.Services.AddScoped(p => p.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

                // =====================================
                // 2. NEON BUCKET (S3-compatible) - Avatar Storage
                // =====================================
                builder.Services.AddHttpContextAccessor();
                builder.Services.AddSingleton<AumoBackend.Services.Storage.IAvatarStorage, AumoBackend.Services.Storage.NeonBucketStorage>();

                // =====================================
                // 3. DATA PROTECTION & PERSISTENCE
                // =====================================
                builder.Services.AddDataProtection()
                    .PersistKeysToDbContext<AppDbContext>()
                    .SetApplicationName("AumoFinanceApp");

                // =====================================
                // 4. ASP.NET CORE IDENTITY SETUP (OPSI A: IdentityRole<Guid>)
                // =====================================
                builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
                {
                    options.SignIn.RequireConfirmedAccount = false;

                    // Aturan Lockout dimatikan/disesuaikan
                    options.Lockout.AllowedForNewUsers = false;

                    options.Password.RequiredLength = 6;
                    options.Password.RequireDigit = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;
                    options.Password.RequireLowercase = false;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders()
                .AddClaimsPrincipalFactory<AumoUserClaimsPrincipalFactory>();

                builder.Services.ConfigureApplicationCookie(options =>
                {
                    options.Cookie.Name = "AumoFinance.Session";
                    options.Cookie.HttpOnly = true;

                    // FIX CROSS-SITE COOKIE (VERCEL -> RENDER):
                    options.Cookie.SameSite = SameSiteMode.None;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

                    options.ExpireTimeSpan = TimeSpan.FromDays(30);
                    options.SlidingExpiration = true;

                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                });

                // =====================================
                // 5. AUTHENTICATION & AUTHORIZATION
                // =====================================
                var jwtSigningKey = builder.Configuration["Jwt:SigningKey"];
                var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AumoFinanceApp";

                if (string.IsNullOrWhiteSpace(jwtSigningKey))
                {
                    throw new InvalidOperationException("Fatal Error: Configuration 'Jwt:SigningKey' is missing.");
                }

                var authBuilder = builder.Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                    options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
                })
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.RequireHttpsMetadata = true; // Wajib HTTPS untuk JWT metadata
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtIssuer,
                        ValidAudience = jwtIssuer,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
                        ClockSkew = TimeSpan.FromMinutes(5),
                    };
                });

                var googleClientId = builder.Configuration["Authentication:Google:ClientId"]
                    ?? builder.Configuration["Google:ClientId"]
                    ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");

                var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
                    ?? builder.Configuration["Google:ClientSecret"]
                    ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");

                if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
                {
                    authBuilder.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
                    {
                        options.ClientId = googleClientId;
                        options.ClientSecret = googleClientSecret;
                        options.SignInScheme = IdentityConstants.ExternalScheme;
                    });
                }

                builder.Services.AddAuthorization(options =>
                {
                    options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .AddAuthenticationSchemes(IdentityConstants.ApplicationScheme, JwtBearerDefaults.AuthenticationScheme)
                        .Build();

                    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                    options.AddPolicy("CanApproveTransaction", policy => policy.RequireClaim("Permission", "Transaction.Approve"));
                });

                // =====================================
                // 6. REST API CORE SETUP, OPENAPI & CORS
                // =====================================
                builder.Services.AddControllers();

                // Native Microsoft OpenAPI Support (.NET 9/10)
                builder.Services.AddOpenApi();

                var allowedOrigins = AllowedOrigins.All;

                builder.Services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
                });

                // =====================================
                // 7. INFRASTRUCTURE, CACHING, RATE LIMITING, VALIDATION & HANGFIRE
                // =====================================
                builder.Services.AddHealthChecks();
                builder.Services.AddMemoryCache();

                // Distributed Cache Configuration (Upstash / Redis TCP dengan Fallback parser & In-Memory)
                var redisUrl = builder.Configuration["Redis:Url"];

                if (!string.IsNullOrWhiteSpace(redisUrl))
                {
                    builder.Services.AddStackExchangeRedisCache(options =>
                    {
                        // Parse URL secara aman menggunakan parser bawaan StackExchange.Redis / Uri
                        if (redisUrl.StartsWith("redis://", StringComparison.OrdinalIgnoreCase) ||
                            redisUrl.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase))
                        {
                            var uri = new Uri(redisUrl);
                            var isSsl = uri.Scheme.Equals("rediss", StringComparison.OrdinalIgnoreCase);
                            var userInfo = uri.UserInfo.Split(':');
                            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : Uri.UnescapeDataString(userInfo[0]);
                            var port = uri.Port > 0 ? uri.Port : (isSsl ? 6380 : 6379);

                            options.ConfigurationOptions = new StackExchange.Redis.ConfigurationOptions
                            {
                                EndPoints = { { uri.Host, port } },
                                Password = password,
                                Ssl = isSsl,
                                AbortOnConnectFail = false,
                            };
                        }
                        else
                        {
                            // Format standar StackExchange (misal: "localhost:6379,password=xxx")
                            options.Configuration = redisUrl;
                        }

                        options.InstanceName = "AumoFinance_";
                    });

                    Log.Information("Distributed Caching (Redis) terkonfigurasi.");
                }
                else
                {
                    builder.Services.AddDistributedMemoryCache();
                    Log.Information("Redis:Url tidak dikonfigurasi. Menggunakan Fallback Distributed Memory Cache.");
                }

                // Auto-register semua FluentValidation Validator
                builder.Services.AddValidatorsFromAssemblyContaining<Program>();

                // Konfigurasi Rate Limiting Middleware
                builder.Services.AddRateLimiter(options =>
                {
                    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                    options.AddPolicy("global", httpContext =>
                        RateLimitPartition.GetFixedWindowLimiter(
                            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                            factory: _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 100,
                                Window = TimeSpan.FromMinutes(1),
                                QueueLimit = 0,
                            }));

                    options.AddPolicy("auth-strict", httpContext =>
                        RateLimitPartition.GetFixedWindowLimiter(
                            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                            factory: _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 10,
                                Window = TimeSpan.FromMinutes(1),
                                QueueLimit = 0,
                            }));
                });

                // HANGFIRE CONFIGURATION (PostgreSQL Storage)
                builder.Services.AddHangfire(config => config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(options =>
                    {
                        options.UseNpgsqlConnection(connectionString);
                    }));

                builder.Services.AddHangfireServer(options =>
                {
                    options.WorkerCount = Environment.ProcessorCount * 2;
                });

                builder.Services.AddScoped<IGuardianService, GuardianService>();
                builder.Services.AddScoped<ITransactionNumberService, TransactionNumberService>();

                // Registrasi service aplikasi (DI)
                builder.Services.AddScoped<AumoBackend.Services.Auth.IAuthService, AumoBackend.Services.Auth.AuthService>();
                builder.Services.AddScoped<AumoBackend.Services.ChartOfAccounts.IChartOfAccountsService, AumoBackend.Services.ChartOfAccounts.ChartOfAccountsService>();
                builder.Services.AddScoped<AumoBackend.Services.Dashboard.IDashboardService, AumoBackend.Services.Dashboard.DashboardService>();
                builder.Services.AddScoped<AumoBackend.Services.Health.IHealthService, AumoBackend.Services.Health.HealthService>();
                builder.Services.AddScoped<AumoBackend.Services.Home.IHomeService, AumoBackend.Services.Home.HomeService>();
                builder.Services.AddScoped<AumoBackend.Services.JournalEntries.IJournalEntryService, AumoBackend.Services.JournalEntries.JournalEntryService>();
                builder.Services.AddScoped<AumoBackend.Services.Notifications.INotificationsService, AumoBackend.Services.Notifications.NotificationsService>();
                builder.Services.AddScoped<AumoBackend.Services.Periods.IPeriodsService, AumoBackend.Services.Periods.PeriodsService>();
                builder.Services.AddScoped<AumoBackend.Services.IFinancialReportService, AumoBackend.Services.FinancialReportService>();
                builder.Services.AddScoped<AumoBackend.Services.Reports.GeneralLedgers.IGeneralLedgersService, AumoBackend.Services.Reports.GeneralLedgers.GeneralLedgersService>();
                builder.Services.AddScoped<AumoBackend.Services.IJournalService, AumoBackend.Services.JournalService>();
                builder.Services.AddScoped<AumoBackend.Services.ITrialBalanceService, AumoBackend.Services.TrialBalanceService>();
                builder.Services.AddScoped<AumoBackend.Services.IWorksheetService, AumoBackend.Services.WorksheetService>();
                builder.Services.AddScoped<AumoBackend.Services.Settings.ISettingsService, AumoBackend.Services.Settings.SettingsService>();
                builder.Services.AddScoped<AumoBackend.Services.Reports.Summary.ISummaryService, AumoBackend.Services.Reports.Summary.SummaryService>();
                builder.Services.AddScoped<AumoBackend.Services.Tools.IToolsService, AumoBackend.Services.Tools.ToolsService>();
                builder.Services.AddHttpClient<IMarketDataService, MarketDataService>();

                // =====================================
                // 8. FORWARDED HEADERS CONFIGURATION
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
                // MIDDLEWARE FORWARDED HEADERS & HTTPS ENFORCEMENT
                // =====================================
                app.UseForwardedHeaders();

                // Paksa scheme menjadi HTTPS di balik reverse proxy (misal: Render.com)
                app.Use(async (context, next) =>
                {
                    if (context.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto) && proto == "https")
                    {
                        context.Request.Scheme = "https";
                    }
                    else
                    {
                        context.Request.Scheme = "https";
                    }

                    await next();
                });

                // =====================================
                // 9. AUTOMATIC DATABASE MIGRATION & SEEDING
                // =====================================
                using (var scope = app.Services.CreateScope())
                {
                    var services = scope.ServiceProvider;
                    try
                    {
                        var context = services.GetRequiredService<AppDbContext>();
                        await context.Database.MigrateAsync();

                        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

                        string[] defaultRoles = { "Admin", "User", "Manager" };

                        foreach (var roleName in defaultRoles)
                        {
                            if (!await roleManager.RoleExistsAsync(roleName))
                            {
                                var role = new IdentityRole<Guid> { Name = roleName };
                                await roleManager.CreateAsync(role);

                                if (roleName == "Admin")
                                {
                                    await roleManager.AddClaimAsync(role, new Claim("Permission", "Transaction.Approve"));
                                    await roleManager.AddClaimAsync(role, new Claim("Permission", "User.Manage"));
                                }
                            }
                        }

                        var adminUser = await userManager.FindByEmailAsync("ndopoer@gmail.com");
                        if (adminUser != null && !await userManager.IsInRoleAsync(adminUser, "Admin"))
                        {
                            await userManager.AddToRoleAsync(adminUser, "Admin");
                        }
                    }
                    catch (Exception ex)
                    {
                        var logger = services.GetRequiredService<ILogger<Program>>();
                        logger.LogError(ex, "Failed to run automatic database migration or seeding.");
                    }
                }

                // =====================================
                // 10. HTTP PIPELINE MIDDLEWARE ORDER
                // =====================================
                if (app.Environment.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                }
                else
                {
                    app.UseHsts();
                    app.UseExceptionHandler(exceptionHandlerApp =>
                    {
                        exceptionHandlerApp.Run(async context =>
                        {
                            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                            var exceptionHandlerFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();

                            if (exceptionHandlerFeature?.Error != null)
                            {
                                logger.LogError(exceptionHandlerFeature.Error, "Unhandled exception on {Path}", context.Request.Path);
                            }

                            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsJsonAsync(new
                            {
                                success = false,
                                message = "A server error occurred. Please try again in a moment.",
                            });
                        });
                    });
                }

                // Serilog HTTP Request Logging
                app.UseSerilogRequestLogging();

                // Route Native OpenAPI JSON & UI Scalar
                app.MapOpenApi();
                app.MapScalarApiReference();

                app.UseRouting();
                app.UseCors("AllowFrontend");

                // Mengaktifkan Rate Limiting Middleware
                app.UseRateLimiter();

                app.UseAuthentication();
                app.UseAuthorization();

                // HANGFIRE DASHBOARD UI (Protected with HTTPS & Admin Authorization Filter)
                app.UseHangfireDashboard("/hangfire", new DashboardOptions
                {
                    Authorization = new[] { new HangfireCustomAuthorizationFilter() },
                });

                // =====================================
                // 11. ENDPOINTS & MAP CONTROLLERS
                // =====================================
                app.MapMethods("/", new[] { "GET", "HEAD" }, () => Results.Ok(new
                {
                    service = "AumoFinance API",
                    status = "Online",
                    timestamp = DateTime.UtcNow,
                })).RequireRateLimiting("global");

                app.MapHealthChecks("/health");

                app.MapPost("/auth/logout", async (SignInManager<ApplicationUser> signInManager) =>
                {
                    await signInManager.SignOutAsync();
                    return Results.Ok(new { success = true, message = "Logout successful" });
                });

                app.MapControllers();

                // =====================================
                // 12. RUN APPLICATION
                // =====================================
                await app.RunAsync();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "AumoBackend terminated unexpectedly!");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }

    /// <summary>
    /// Security Filter untuk Dashboard Hangfire: Memastikan request menggunakan HTTPS dan user adalah Admin.
    /// </summary>
    public class HangfireCustomAuthorizationFilter : IDashboardAuthorizationFilter
    {
        /// <inheritdoc/>
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();

            // 1. Wajib HTTPS (baik langsung atau via Reverse Proxy Header)
            var isHttps = httpContext.Request.IsHttps ||
                          httpContext.Request.Headers["X-Forwarded-Proto"] == "https";

            if (!isHttps && !httpContext.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            // 2. Wajib Authenticated & Role Admin
            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                return httpContext.User.IsInRole("Admin");
            }

            return false;
        }
    }
}