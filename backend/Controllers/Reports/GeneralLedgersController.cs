using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/api/v1/reports/general-ledgers")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class GeneralLedgersController : ControllerBase
{
    private readonly IGeneralLedgersService _glService;
    public GeneralLedgersController(IGeneralLedgersService glService) => _glService = glService;

    [HttpGet("permanent")]
    public async Task<IActionResult> GetPermanentGeneralLedger()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(new { success = false, message = "User identity invalid." });

        var result = await _glService.GetPermanentLedgersAsync(userId);
        if (!result.Success || result.Data == null)
            return NotFound(new { success = false, hasPeriodSelected = false, message = result.Message });

        return Ok(new { success = true, hasPeriodSelected = true, selectedPeriodName = result.Data.SelectedPeriodName, isTemporary = false, accounts = result.Data.Accounts });
    }

    [HttpGet("temporary")]
    public async Task<IActionResult> GetTemporaryGeneralLedger()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(new { success = false, message = "User identity invalid." });

        var result = await _glService.GetTemporaryLedgersAsync(userId);
        if (!result.Success || result.Data == null)
            return NotFound(new { success = false, hasPeriodSelected = false, message = result.Message });

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = result.Data.SelectedPeriodName,
            isTemporary = true,
            netIncomeBeforeClosing = result.Data.NetIncomeBeforeClosing,
            accounts = result.Data.Accounts
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshLedgerData()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(new { success = false, message = "User identity invalid." });
        var result = await _glService.RefreshGeneralLedgersAsync(userId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(id, out var guid) ? guid : Guid.Empty;
    }
}
