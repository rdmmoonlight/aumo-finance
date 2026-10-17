using Hangfire.Dashboard;

namespace AumoBackend.Middlewares;

public class HangfireCustomAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        var isHttps = httpContext.Request.IsHttps ||
                      httpContext.Request.Headers["X-Forwarded-Proto"] == "https";

        if (!isHttps && !httpContext.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            return httpContext.User.IsInRole("Admin");
        }

        return false;
    }
}