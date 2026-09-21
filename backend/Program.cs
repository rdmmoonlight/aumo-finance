using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AumoBackend.Controllers.Api;
using AumoBackend.Core;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace AumoBackend
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =====================================
            // 1. DATABASE CONFIGURATION (PostgreSQL)
            // =====================================
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("DATABASE_URL");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Database connection string 'DefaultConnection' or 'DATABASE_URL' is missing.");
            }

            builder.Services.AddDbContextFactory<AppDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
                options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });

            builder.Services.AddScoped(p => p.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

            // =====================================
            // 2. DATA PROTECTION & PERSISTENCE
            // =====================================
            builder.Services.AddDataProtection()
                .PersistKeysToDbContext<AppDbContext>()
                .SetApplicationName("AumoFinanceApp");

            // =====================================
            // 3. ASP.NET CORE IDENTITY SETUP
            // =====================================
            builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

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
            // 4. AUTHENTICATION & AUTHORIZATION
            // =====================================
            var jwtSigningKey = builder.Configuration["JWT_SIGNING_KEY"]
                ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");

            var jwtIssuer = builder.Configuration["JWT_ISSUER"]
                ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? "AumoFinanceApp";

            if (string.IsNullOrWhiteSpace(jwtSigningKey))
            {
                throw new InvalidOperationException("Fatal Error: Environment variable 'JWT_SIGNING_KEY' is missing.");
            }

            var authBuilder = builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.RequireHttpsMetadata = false;
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
                    ClockSkew = TimeSpan.FromMinutes(5)
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
            // 5. REST API CORE SETUP, OPENAPI & CORS
            // =====================================
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // --- Microsoft Native OpenAPI Support ---
            builder.Services.AddOpenApi(); 

            // Swashbuckle SwaggerGen (Menggunakan Fully Qualified Namespaces)
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
                { 
                    Title = "AumoFinance API", 
                    Version = "v1" 
                });

                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter the JWT token in the format: Bearer <your_token>"
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var originsList = new List<string>
            {
                "http://localhost:3000",
                "https://my-authentic-web.vercel.app",
                "https://aumo-finance-web.vercel.app",
            };

            var allowedOrigins = originsList.Distinct().ToArray();

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
            // 6. INFRASTRUCTURE & HEALTH CHECKS
            // =====================================
            builder.Services.AddHealthChecks();
            builder.Services.AddMemoryCache();

            builder.Services.AddScoped<IGuardianService, GuardianService>();
            builder.Services.AddScoped<ITransactionNumberService, TransactionNumberService>();
            builder.Services.AddTransient<ResendEmailSender>();
            builder.Services.AddTransient<AumoBackend.Core.IEmailSender, AumoBackend.Core.ResendEmailSender>();
            builder.Services.AddTransient<Microsoft.AspNetCore.Identity.IEmailSender<ApplicationUser>, IdentityEmailSenderBridge>();

            // =====================================
            // 7. FORWARDED HEADERS CONFIGURATION
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
            // MIDDLEWARE FORWARDED HEADERS & HTTPS
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

            // =====================================
            // 8. AUTOMATIC DATABASE MIGRATION & SEEDING
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
            // 9. HTTP PIPELINE MIDDLEWARE ORDER
            // =====================================
            app.MapOpenApi(); // Menghasilkan OpenAPI JSON di "/openapi/v1.json"

            app.UseSwagger();
            app.UseSwaggerUI();

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
                            message = "A server error occurred. Please try again in a moment."
                        });
                    });
                });
            }

            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            // =====================================
            // 10. ENDPOINTS & MAP CONTROLLERS
            // =====================================
            app.MapMethods("/", new[] { "GET", "HEAD" }, () => Results.Ok(new
            {
                service = "AumoFinance API",
                status = "Online",
                timestamp = DateTime.UtcNow
            }));

            app.MapHealthChecks("/health");

            app.MapPost("/auth/logout", async (SignInManager<ApplicationUser> signInManager) =>
            {
                await signInManager.SignOutAsync();
                return Results.Ok(new { success = true, message = "Logout successful" });
            });

            app.MapControllers();

            // =====================================
            // 11. RUN APPLICATION
            // =====================================
            await app.RunAsync();
        }
    }

    // =====================================
    // 12. IDENTITY EMAIL SENDER BRIDGE CLASS
    // =====================================
    public class IdentityEmailSenderBridge : IEmailSender<ApplicationUser>
    {
        private readonly ResendEmailSender _emailSender;

        public IdentityEmailSenderBridge(ResendEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink)
        {
            var message = $"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Confirm Your Email</h2>
                    <p>Hello {user.FullName ?? user.UserName},</p>
                    <p>Please confirm your account email by clicking the link below:</p>
                    <p><a href="{confirmationLink}" style="background-color: #0d6efd; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                """;

            return _emailSender.SendEmailAsync(email, "Confirm your email - Aumo Finance", message);
        }

        public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink)
        {
            var message = $"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Reset Your Password</h2>
                    <p>Hello {user.FullName ?? user.UserName},</p>
                    <p>You can reset your password by clicking the link below:</p>
                    <p><a href="{resetLink}" style="background-color: #0d6efd; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                </div>
                """;

            return _emailSender.SendEmailAsync(email, "Reset your password - Aumo Finance", message);
        }

        public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode)
        {
            var message = $"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Reset Password Code</h2>
                    <p>Hello {user.FullName ?? user.UserName},</p>
                    <p>Your password reset code is: <strong>{resetCode}</strong></p>
                </div>
                """;

            return _emailSender.SendEmailAsync(email, "Reset password code - Aumo Finance", message);
        }
    }
}