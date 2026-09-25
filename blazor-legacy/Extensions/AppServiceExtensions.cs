using System;
using AumoBlazor.Configurations;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AumoBlazor.Extensions
{
    public static class AppServiceExtensions
    {
        public static AppConfig AddAppConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            var config = new AppConfig();

            // Web API URL
            var webApi = configuration["WEB_API_URL"] ?? Environment.GetEnvironmentVariable("WEB_API_URL");
            if (!string.IsNullOrWhiteSpace(webApi))
            {
                config.WebApiUrl = webApi.EndsWith("/") ? webApi : webApi + "/";
            }

            // App Name
            config.AppName = configuration["APP_NAME"] 
                ?? Environment.GetEnvironmentVariable("APP_NAME") 
                ?? config.AppName;

            // Auth Paths & Expire
            config.AuthLoginPath = configuration["AUTH_LOGIN_PATH"] ?? config.AuthLoginPath;
            config.AuthAccessDeniedPath = configuration["AUTH_ACCESS_DENIED_PATH"] ?? config.AuthAccessDeniedPath;
            
            if (int.TryParse(configuration["AUTH_COOKIE_EXPIRE_DAYS"], out var days))
            {
                config.AuthCookieExpireDays = days;
            }

            // Market User Agent
            config.MarketUserAgent = configuration["MARKET_USER_AGENT"] 
                ?? Environment.GetEnvironmentVariable("MARKET_USER_AGENT") 
                ?? $"{config.AppName}/1.0";

            // Register sebagai Singleton agar bisa di-inject di kelas lain jika butuh
            services.AddSingleton(config);

            return config;
        }

        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, AppConfig config)
        {
            services.AddDataProtection()
                .SetApplicationName(config.AppName);

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "AumoFinance.Session";
                    options.LoginPath = config.AuthLoginPath;
                    options.AccessDeniedPath = config.AuthAccessDeniedPath;
                    options.ExpireTimeSpan = TimeSpan.FromDays(config.AuthCookieExpireDays);
                    options.SlidingExpiration = true;
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
                });

            return services;
        }
    }
}
