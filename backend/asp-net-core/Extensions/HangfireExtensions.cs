using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace AumoBackend.Extensions;

public static class HangfireExtensions
{
    public static IApplicationBuilder UseCustomHangfireDashboard(this WebApplication app)
    {
        var options = new DashboardOptions
        {
            Authorization = [new HangfireCustomAuthorizationFilter(app.Environment.IsDevelopment())],
            DashboardTitle = "AumoBackend Jobs",
            IgnoreAntiforgeryToken = true // Mencegah 400/404 pada beberapa request AJAX dashboard di Render
        };

        // Menggunakan /hangfire tanpa membatasi trailing slash
        app.UseHangfireDashboard("/hangfire", options);

        return app;
    }
}

public class HangfireCustomAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly bool _isDevelopment;

    public HangfireCustomAuthorizationFilter(bool isDevelopment = false)
    {
        _isDevelopment = isDevelopment;
    }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // 1. Loloskan jika di mode Development
        if (_isDevelopment)
        {
            return true;
        }

        // 2. Di Render / Production:
        // Jika belum mengimplementasikan auth cookie/query token, 
        // pastikan set sementara ke true untuk verifikasi apakah 404/401 hilang.
        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.IsInRole("Admin");
    }
}