using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AumoBackend.Data; // Sesuaikan namespace ApplicationDbContext Anda

namespace AumoBackend.Controllers;

[ApiController]
[Route("api/v1/health")]
[AllowAnonymous] // Bebas diakses tanpa butuh login/cookie/token
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public HealthController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            // Mengecek apakah koneksi database PostgreSQL aktif
            bool canConnect = await _dbContext.Database.CanConnectAsync();

            if (canConnect)
            {
                return Ok(new
                {
                    status = "online",
                    database = "connected",
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(503, new
            {
                status = "offline",
                database = "disconnected",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new
            {
                status = "offline",
                database = "error",
                message = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
