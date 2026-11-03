using System.Diagnostics;
using Serilog;

namespace AumoBackend.Middlewares;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            LogRequest(context, stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    private static void LogRequest(HttpContext context, double elapsedMs)
    {
        var method = context.Request.Method;
        var path = context.Request.Path + context.Request.QueryString;
        var statusCode = context.Response.StatusCode;

        // Reset ANSI
        const string reset = "\x1b[0m";

        // Warna HTTP Method: GET (Cyan), POST (Hijau), PUT (Kuning), DELETE (Merah)
        var methodColor = method switch
        {
            "GET" => "\x1b[96m",
            "POST" => "\x1b[92m",
            "PUT" => "\x1b[93m",
            "PATCH" => "\x1b[33m",
            "DELETE" => "\x1b[91m",
            _ => "\x1b[97m"
        };

        // Warna Status Code: 2xx (Hijau), 3xx (Cyan), 4xx (Kuning), 5xx (Merah)
        var statusColor = statusCode switch
        {
            >= 200 and < 300 => "\x1b[92m",
            >= 300 and < 400 => "\x1b[96m",
            >= 400 and < 500 => "\x1b[93m",
            >= 500 => "\x1b[91m",
            _ => "\x1b[97m"
        };

        Log.Information(
            "HTTP {MethodColor}{Method}{Reset} {Path} responded {StatusColor}{StatusCode}{Reset} in {Elapsed:0.0000} ms",
            methodColor, method, reset, path, statusColor, statusCode, reset, elapsedMs);
    }
}

public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseCustomRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}