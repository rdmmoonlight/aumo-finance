using System.Text;
using AumoBackend.Data;
using AumoBackend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace AumoBackend.Extensions;

public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityAndAuthServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Registrasi ASP.NET Core Identity (Default berbasis Cookie)
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        // 2. Konfigurasi Autentikasi Dual (Cookie untuk Web + JwtBearer untuk Mobile)
        var authBuilder = services.AddAuthentication(options =>
        {
            // 🔑 PENTING: Default scheme diatur ke Cookie (Identity.Application)
            // Agar request Web tidak error melacak skema 'Bearer'
            options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
            options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
            options.DefaultSignInScheme = IdentityConstants.ApplicationScheme;
        });

        // 3. Tambahkan Handler JWT Bearer Khusus untuk Mobile Client
        var jwtKey = configuration["Jwt:Key"];
        var issuer = configuration["Jwt:Issuer"];
        var audience = configuration["Jwt:Audience"];

        if (!string.IsNullOrWhiteSpace(jwtKey))
        {
            authBuilder.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });
        }

        // 4. Konfigurasi Cookie Cookie HTTP-Only untuk Web Client
        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.None; // Wajib jika Web SPA & API beda origin/domain
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Wajib HTTPS di Production
            options.Events.OnRedirectToLogin = context =>
            {
                // Mencegah redirect HTML 302 saat request API Web tidak terautentikasi
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        return services;
    }
}
