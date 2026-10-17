using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using AumoBackend.Data;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services;
using AumoBackend.Services.Auth;
using AumoBackend.Services.ChartOfAccounts;
using AumoBackend.Services.Core;
using AumoBackend.Services.Dashboard;
using AumoBackend.Services.Health;
using AumoBackend.Services.Home;
using AumoBackend.Services.Identity;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Notifications;
using AumoBackend.Services.Periods;
using AumoBackend.Services.Reports.GeneralLedgers;
using AumoBackend.Services.Reports.Summary;
using AumoBackend.Services.Settings;
using AumoBackend.Services.Storage;
using AumoBackend.Services.Tools;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using StackExchange.Redis;

namespace AumoBackend.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' is missing.");

        services.AddDbContextFactory<AppDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);

                npgsqlOptions.CommandTimeout(30);
            });

            options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        services.AddScoped(p => p.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

        services.AddDataProtection()
            .PersistKeysToDbContext<AppDbContext>()
            .SetApplicationName("AumoFinanceApp");

        return services;
    }

    public static IServiceCollection AddIdentityAndAuthServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.SignIn.RequireConfirmedAccount = false;
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

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "AumoFinance.Session";
            options.Cookie.HttpOnly = true;
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

        var jwtSigningKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("Fatal Error: Configuration 'Jwt:SigningKey' is missing.");
        var jwtIssuer = configuration["Jwt:Issuer"] ?? "AumoFinanceApp";

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
            options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.RequireHttpsMetadata = true;
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

        var googleClientId = configuration["Authentication:Google:ClientId"]
            ?? configuration["Google:ClientId"]
            ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");

        var googleClientSecret = configuration["Authentication:Google:ClientSecret"]
            ?? configuration["Google:ClientSecret"]
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

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddAuthenticationSchemes(IdentityConstants.ApplicationScheme, JwtBearerDefaults.AuthenticationScheme)
                .Build();

            options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
            options.AddPolicy("CanApproveTransaction", policy => policy.RequireClaim("Permission", "Transaction.Approve"));
        });

        return services;
    }

    public static IServiceCollection AddCacheAndInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks();
        services.AddMemoryCache();

        var redisUrl = configuration["Redis:Url"];
        if (!string.IsNullOrWhiteSpace(redisUrl))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                if (redisUrl.StartsWith("redis://", StringComparison.OrdinalIgnoreCase) ||
                    redisUrl.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase))
                {
                    var uri = new Uri(redisUrl);
                    var isSsl = uri.Scheme.Equals("rediss", StringComparison.OrdinalIgnoreCase);
                    var userInfo = uri.UserInfo.Split(':');
                    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : Uri.UnescapeDataString(userInfo[0]);
                    var port = uri.Port > 0 ? uri.Port : (isSsl ? 6380 : 6379);

                    options.ConfigurationOptions = new ConfigurationOptions
                    {
                        EndPoints = { { uri.Host, port } },
                        Password = password,
                        Ssl = isSsl,
                        AbortOnConnectFail = false,
                    };
                }
                else
                {
                    options.Configuration = redisUrl;
                }

                options.InstanceName = "AumoFinance_";
            });

            Log.Information("Distributed Caching (Redis) terkonfigurasi.");
        }
        else
        {
            services.AddDistributedMemoryCache();
            Log.Information("Redis:Url tidak dikonfigurasi. Menggunakan Fallback Distributed Memory Cache.");
        }

        services.AddRateLimiter(options =>
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

        var connectionString = configuration.GetConnectionString("DefaultConnection")!;
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options =>
            {
                options.UseNpgsqlConnection(connectionString);
            }));

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 2;
        });

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddSingleton<IAvatarStorage, NeonBucketStorage>();

        services.AddScoped<IGuardianService, GuardianService>();
        services.AddScoped<ITransactionNumberService, TransactionNumberService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IChartOfAccountsService, ChartOfAccountsService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IHealthService, HealthService>();
        services.AddScoped<IHomeService, HomeService>();
        services.AddScoped<IJournalEntryService, JournalEntryService>();
        services.AddScoped<INotificationsService, NotificationsService>();
        services.AddScoped<IPeriodsService, PeriodsService>();
        services.AddScoped<IFinancialReportService, FinancialReportService>();
        services.AddScoped<IGeneralLedgersService, GeneralLedgersService>();
        services.AddScoped<IJournalService, JournalService>();
        services.AddScoped<ITrialBalanceService, TrialBalanceService>();
        services.AddScoped<IWorksheetService, WorksheetService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<ISummaryService, SummaryService>();
        services.AddScoped<IToolsService, ToolsService>();
        services.AddScoped<IRustCoreService, RustCoreService>();

        services.AddHttpClient<IMarketDataService, MarketDataService>();

        return services;
    }
}