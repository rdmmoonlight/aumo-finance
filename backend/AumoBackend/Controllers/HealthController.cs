namespace AumoBackend.Controllers;

using System;
using System.Threading.Tasks;
using AumoBackend.Services.Health;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/health")]
[Route("/api/v1/health")]
[AumoBackend.Extensions.NoApiPrefix]
[AllowAnonymous]

public class HealthController : ControllerBase
{
    private readonly IHealthService healthService;

    public HealthController(IHealthService healthService)
    {
        this.healthService = healthService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            // Cek koneksi ke database PostgreSQL lewat service
            bool canConnect = await this.healthService.CanConnectToDatabaseAsync();

            if (canConnect)
            {
                return this.Ok(new
                {
                    status = "online",
                    database = "connected",
                    commit = Environment.GetEnvironmentVariable("RENDER_GIT_COMMIT"),
                    timestamp = DateTime.UtcNow,
                });
            }

            return this.StatusCode(503, new
            {
                status = "offline",
                database = "disconnected",
                timestamp = DateTime.UtcNow,
            });
        }
        catch (Exception ex)
        {
            return this.StatusCode(503, new
            {
                status = "offline",
                database = "error",
                message = ex.Message,
                timestamp = DateTime.UtcNow,
            });
        }
    }
}
