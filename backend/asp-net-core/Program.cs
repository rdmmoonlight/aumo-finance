using System.Globalization;
using System.Security.Claims;
using AumoBackend.Data;
using AumoBackend.Extensions;
using AumoBackend.Helpers;
using AumoBackend.Middlewares;
using AumoBackend.Models;
using FluentValidation;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using Serilog;

namespace AumoBackend;

public partial class Program
{
    private static readonly string[] RootMethods = ["GET", "HEAD"];

    [LoggerMessage(EventId = 1001, Level = LogLevel.Error, Message = "Failed to run automatic database migration or seeding.")]
    private static partial void LogMigrationFailed(Microsoft.Extensions.Logging.ILogger logger, Exception exception);

    [LoggerMessage(EventId = 1002, Level = LogLevel.Error, Message = "Unhandled exception on {Path}")]
    private static partial void LogUnhandledException(Microsoft.Extensions.Logging.ILogger logger, Exception exception, PathString path);

    public static async Task Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console(formatProvider: CultureInfo.InvariantCulture)
            .CreateBootstrapLogger();

        try
        {
            Log.Information("Starting AumoBackend web application...");

            var builder = WebApplication.CreateBuilder(args);

            builder.Host.UseSerilog((context, services, configuration) => configuration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                .WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

            // 1. Forwarded Headers Configuration (Render.com / Nginx Proxy)
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            // 2. Cegah Identity memicu Redirect HTML ber-port :10000 pada request API
            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    // Jika request berasal dari API atau Auth endpoint, kembalikan 401 murni tanpa redirect
                    if (context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/auth"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }

                    // Untuk navigasi halaman biasa, bersihkan port internal jika ada
                    var redirectUriBuilder = new UriBuilder(context.RedirectUri)
                    {
                        Port = -1
                    };
                    context.Response.Redirect(redirectUriBuilder.Uri.ToString());
                    return Task.CompletedTask;
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/auth"))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }

                    var redirectUriBuilder = new UriBuilder(context.RedirectUri)
                    {
                        Port = -1
                    };
                    context.Response.Redirect(redirectUriBuilder.Uri.ToString());
                    return Task.CompletedTask;
                };
            });

            builder.Services.AddHttpClient();
            builder.Services.AddDatabaseServices(builder.Configuration);
            builder.Services.AddIdentityAndAuthServices(builder.Configuration);
            builder.Services.AddCacheAndInfrastructure(builder.Configuration);
            builder.Services.AddApplicationServices();

            builder.Services.AddControllers();

            // ✅ OpenAPI Document Generator + Dinamis Server URL & JWT Bearer
            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    var configuration = context.ApplicationServices.GetRequiredService<IConfiguration>();
                    
                    // 1. Set Server URL Dinamis dari appsettings/Environment Variables
                    var serverUrl = configuration["Scalar:ServerUrl"] ?? "https://aumoweb.onrender.com";
                    document.Servers = new List<OpenApiServer>
                    {
                        new OpenApiServer { Url = serverUrl, Description = "Production Server" }
                    };

                    // 2. Set JWT Bearer Authentication Dinamis
                    var enableAuth = configuration.GetValue<bool>("Jwt:EnableScalarAuth", true);
                    if (enableAuth)
                    {
                        var schemeName = configuration["Jwt:SchemeName"] ?? JwtBearerDefaults.AuthenticationScheme;
                        var description = configuration["Jwt:Description"] ?? "Masukkan JWT Token dengan format: Bearer {token}";

                        var securityScheme = new OpenApiSecurityScheme
                        {
                            Name = "Authorization",
                            Description = description,
                            In = ParameterLocation.Header,
                            Type = SecuritySchemeType.Http,
                            Scheme = schemeName.ToLowerInvariant(),
                            BearerFormat = "JWT",
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = schemeName
                            }
                        };

                        document.Components ??= new OpenApiComponents();
                        document.Components.SecuritySchemes[schemeName] = securityScheme;

                        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
                        {
                            [securityScheme] = Array.Empty<string>()
                        });
                    }

                    return Task.CompletedTask;
                });
            });

            builder.Services.AddHealthChecks();

            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

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

            builder.Services.AddValidatorsFromAssemblyContaining<Program>();

            var app = builder.Build();

            // Forwarded Headers Middleware diletakkan paling atas
            app.UseForwardedHeaders();

            app.Use(async (context, next) =>
            {
                context.Request.Scheme = "https";
                await next();
            });

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();
                    await context.Database.MigrateAsync();

                    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

                    string[] defaultRoles = ["Admin", "User", "Manager"];

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
                    LogMigrationFailed(logger, ex);
                }
            }

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

                        if (exceptionHandlerFeature?.Error is { } error)
                        {
                            LogUnhandledException(logger, error, context.Request.Path);
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

            // ✅ Map OpenAPI Document Generator
            app.MapOpenApi();

            // ✅ Membaca Konfigurasi Scalar dari Environment / appsettings.json
            var scalarTitle = app.Configuration["Scalar:Title"] ?? "Aumo Web API Reference";
            var scalarRoutePrefix = app.Configuration["Scalar:RoutePrefix"] ?? "/reference";

            // ✅ Map Scalar UI menggunakan Options yang Valid
            app.MapScalarApiReference(scalarRoutePrefix, options =>
            {
                options
                    .WithTitle(scalarTitle)
                    .WithTheme(ScalarTheme.Moon)
                    .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Fetch);
            });

            app.UseSerilogRequestLogging();

            app.UseRouting();

            app.UseCors("AllowFrontend");

            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = [new HangfireCustomAuthorizationFilter()],
            });

            app.MapMethods("/", RootMethods, () => Results.Ok(new
            {
                service = "AumoFinance API",
                status = "Online",
                timestamp = DateTime.UtcNow,
            })).RequireRateLimiting("global");

            app.MapHealthChecks("/health");
            app.MapControllers();

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
