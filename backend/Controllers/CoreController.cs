// backend/Controllers/CoreController.cs
using AumoBackend.Services.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoreController : ControllerBase
{
    private readonly IRustCoreService _rustCoreService;

    public CoreController(IRustCoreService rustCoreService)
    {
        _rustCoreService = rustCoreService;
    }

    [HttpGet("salam")]
    [AllowAnonymous] // sementara biar mudah ditest
    public async Task<IActionResult> Salam(CancellationToken ct)
    {
        var result = await _rustCoreService.GetSalamAsync(ct);
        
        if (result is null)
        {
            return StatusCode(503, new { message = "Rust Core sedang tidak tersedia" });
        }

        return Ok(result);
    }
}
