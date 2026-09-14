using System.Text;
using AumoBackend.Models;
using AumoBackend.Services; // 6 file baru lu
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
// Ini bawaan Core Identity, bukan custom
using Microsoft.AspNetCore.Identity.UI.Services; 

namespace AumoBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =====================================
            // 1. DATABASE
            // =====================================
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("DATABASE_URL");
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("Database connection string missing.");

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
                options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
            builder.Services.AddDbContextFactory<AppDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
                options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            }, ServiceLifetime.Scoped);

            // =====================================
            // 2. DATA PROTECTION
            // =====================================
            builder.Services.AddDataProtection()
                .PersistKeysToDbContext<AppDbContext>()
                .SetApplicationName("AumoFinanceApp");

            // =====================================
            // 3. IDENTITY
            // =====================================
            builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders()
            .AddClaimsPrincipalFactory<AumoUserClaimsPrincipalFactory>();

            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.Name = "AumoFinance.Session";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true;
                options.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
                options.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
            });

            // =====================================
            // 4. AUTH (JWT & GOOGLE)
            // =====================================
            var jwtSigningKey = builder.Configuration["JWT_SIGNING_KEY"] ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");
            var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "AumoFinanceApp";
            if (string.IsNullOrWhiteSpace(jwtSigningKey)) throw new InvalidOperationException("JWT_SIGNING_KEY missing.");

            var authBuilder = builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = IdentityConstants.ApplicationScheme;
                options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer, ValidAudience = jwtIssuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
                    ClockSkew = TimeSpan.FromMinutes(5)
                };
            });

            var googleClientId = builder.Configuration["Authentication:Google:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
            var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
            if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
            {
                authBuilder.AddGoogle(options => { options.ClientId = googleClientId; options.ClientSecret = googleClientSecret; options.SignInScheme = IdentityConstants.ExternalScheme; });
            }

            builder.Services.AddAuthorization(options =>
            {
                options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddAuthenticationSchemes(IdentityConstants.ApplicationScheme, JwtBearerDefaults.AuthenticationScheme)
                .Build();
            });

            // =====================================
            // 5. API, SWAGGER, CORS
            // =====================================
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "AumoFinance API", Version = "v1" });
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Name = "Authorization", Type = SecuritySchemeType.Http, Scheme = "Bearer", BearerFormat = "JWT", In = ParameterLocation.Header, Description = "Bearer {token}" });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement { { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() } });
            });

            var allowedOrigins = new[] { "http://localhost:3000", "https://my-authentic-web.vercel.app", "https://aumo-finance-web.vercel.app" }.Distinct().ToArray();
            builder.Services.AddCors(options => { options.AddPolicy("AllowFrontend", p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()); });

            // =====================================
            // 6. APPLICATION SERVICES - CUMA 6 FILE
            // =====================================
            builder.Services.AddHealthChecks();
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpClient("MarketApiClient", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(15);
                client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 AumoFinance/1.0");
            });

            // --- 6a. INFRASTRUCTURE (File ke-6: InfrastructureServices.cs) ---
            builder.Services.AddScoped<IGuardianService, GuardianService>();
            builder.Services.AddScoped<IMarketService, MarketService>();
            builder.Services.AddScoped<ITransactionNumberService, TransactionNumberService>();
            builder.Services.AddScoped<DashboardDataService>();
            builder.Services.AddHttpClient<IAiService, AiService>();
            builder.Services.AddHostedService<RenderKeepAliveService>();
            builder.Services.AddScoped<IEmailSender, ResendEmailSender>(); 
            builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IEmailSender<ApplicationUser>, IdentityEmailSender>();

            // --- 6b. ACCOUNTING CYCLE (5 File Utama) ---
            builder.Services.AddScoped<IJournalService, JournalService>();
            builder.Services.AddScoped<ILedgerService, LedgerService>();
            builder.Services.AddScoped<ITrialBalanceService, TrialBalanceService>();
            builder.Services.AddScoped<IWorksheetService, WorksheetService>();
            builder.Services.AddScoped<IFinancialStatementService, FinancialStatementService>();

            // =====================================
            // 7. FORWARDED HEADERS
            // =====================================
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownIPNetworks.Clear(); options.KnownProxies.Clear();
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                try { scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate(); }
                catch (Exception ex) { scope.ServiceProvider.GetRequiredService<ILogger<Program>>().LogError(ex, "Migration failed"); }
            }

            app.UseForwardedHeaders();
            app.UseSwagger(); app.UseSwaggerUI();
            if (app.Environment.IsDevelopment()) app.UseDeveloperExceptionPage();
            else
            {
                app.UseHsts();
                app.Use(async (ctx, next) => { try { await next(); } catch (Exception ex) { var log = ctx.RequestServices.GetRequiredService<ILogger<Program>>(); log.LogError(ex, "Unhandled {Path}", ctx.Request.Path); if (!ctx.Response.HasStarted) { ctx.Response.StatusCode = 500; await ctx.Response.WriteAsJsonAsync(new { success = false, message = "Server error" }); } } });
            }

            app.UseRouting(); app.UseCors("AllowFrontend"); app.UseAuthentication(); app.UseAuthorization();
            app.MapGet("/", () => Results.Ok(new { service = "AumoFinance API", status = "Online", timestamp = DateTime.UtcNow }));
            app.MapHealthChecks("/health");
            app.MapPost("/auth/logout", async (SignInManager<ApplicationUser> sm) => { await sm.SignOutAsync(); return Results.Ok(new { success = true }); });
            app.MapControllers();
            app.Run();
        }
    }
}