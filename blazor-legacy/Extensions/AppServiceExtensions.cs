using System;
using AumoBlazor.Configurations;
using AumoFinance.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.Circuits;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AumoBlazor.Extensions
{
    public static class AppServiceExtensions
    {
        public static AppConfig AddAppConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            var config = new AppConfig();

            var webApi = configuration["WEB_API_URL"] ?? Environment.GetEnvironmentVariable("WEB_API_URL");
            if (!string.IsNullOrWhiteSpace(webApi))
            {
                config.WebApiUrl = webApi.EndsWith("/") ? webApi : webApi + "/";
            }

            config.AppName = configuration["APP_NAME"]
                ?? Environment.GetEnvironmentVariable("APP_NAME")
                ?? config.AppName;

            config.AuthLoginPath = configuration["AUTH_LOGIN_PATH"] ?? config.AuthLoginPath;
            config.AuthAccessDeniedPath = configuration["AUTH_ACCESS_DENIED_PATH"] ?? config.AuthAccessDeniedPath;

            if (int.TryParse(configuration["AUTH_COOKIE_EXPIRE_DAYS"], out var days))
            {
                config.AuthCookieExpireDays = days;
            }

            config.MarketUserAgent = configuration["MARKET_USER_AGENT"]
                ?? Environment.GetEnvironmentVariable("MARKET_USER_AGENT")
                ?? $"{config.AppName}/1.0";

            services.AddSingleton(config);
            return config;
        }

        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, AppConfig config, Func<HttpRequest, bool> isApiOrBlazorCircuit)
        {
            services.AddDataProtection().SetApplicationName(config.AppName);

            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
                options.Secure = CookieSecurePolicy.Always;
            });

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
                    options.Cookie.SameSite = SameSiteMode.Lax;

                    options.Events.OnRedirectToLogin = context =>
                    {
                        if (isApiOrBlazorCircuit(context.Request))
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
                        if (isApiOrBlazorCircuit(context.Request))
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

            services.AddAuthorization();
            services.AddScoped<AuthenticationStateProvider, ApiAuthenticationStateProvider>();
            services.AddCascadingAuthenticationState();

            return services;
        }

        public static IServiceCollection AddHttpAndCircuitServices(this IServiceCollection services, AppConfig config)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<CircuitCookieStore>();
            services.AddScoped<CircuitHandler, CookieCircuitHandler>();
            services.AddTransient<CookieHeaderHandler>();

            services.AddHttpClient("BackendApi", client =>
            {
                client.BaseAddress = new Uri(config.WebApiUrl);
                client.Timeout = TimeSpan.FromSeconds(15);
            })
            .AddHttpMessageHandler<CookieHeaderHandler>()
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                UseCookies = false
            });

            services.AddScoped(sp =>
            {
                var factory = sp.GetRequiredService<IHttpClientFactory>();
                return factory.CreateClient("BackendApi");
            });

            services.AddHttpClient("MarketApiClient", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(15);
                client.DefaultRequestHeaders.UserAgent.ParseAdd(config.MarketUserAgent);
            });

            return services;
        }
    }
}
