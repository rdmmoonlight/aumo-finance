using Hangfire;
using Hangfire.Dashboard;

namespace AumoBackend.Extensions;

public static class HangfireExtensions
{
    public static IApplicationBuilder UseCustomHangfireDashboard(this WebApplication app)
    {
        var options = new DashboardOptions
        {
            Authorization = [new HangfireCustomAuthorizationFilter(app.Environment.IsDevelopment())],
            DashboardTitle = "AumoBackend Jobs"
        };

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
        // 1. Langsung izinkan akses jika running di Environment Development
        if (_isDevelopment)
        {
            return true;
        }

        var httpContext = context.GetHttpContext();

        // 2. Di Production: Wajib terautentikasi dan memiliki role Admin
        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.IsInRole("Admin");
    }
}