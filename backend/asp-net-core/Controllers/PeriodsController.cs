namespace AumoBackend.Controllers;

using System.Security.Claims;
using AumoBackend.DTOs;
using AumoBackend.Services.Periods;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/periods")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class PeriodsController : ControllerBase
{
    private readonly IPeriodsService periodsService;
    private readonly IValidator<CreatePeriodRequest> createPeriodValidator;

    public PeriodsController(
        IPeriodsService periodsService,
        IValidator<CreatePeriodRequest> createPeriodValidator)
    {
        this.periodsService = periodsService;
        this.createPeriodValidator = createPeriodValidator;
    }

    // ==========================================
    // 1. GET: /periods (Period List & Selection Status)
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetPeriods()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.periodsService.GetPeriodsAsync(userId);
        return this.Ok(result);
    }

    // ==========================================
    // 2. GET: /periods/open-info
    // ==========================================
    [HttpGet("open-info")]
    public async Task<IActionResult> GetOpenPeriodInfo()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.periodsService.GetOpenPeriodInfoAsync(userId);
        return this.Ok(result);
    }

    // ==========================================
    // 3. POST: /periods (Open New Period)
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> CreatePeriod([FromBody] CreatePeriodRequest request)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var validation = await this.createPeriodValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var result = await this.periodsService.CreatePeriodAsync(userId, request);

        if (result.Success)
        {
            return this.Ok(new { success = true, message = result.Message, periodId = result.PeriodId });
        }

        var body = new { success = false, message = result.Message };
        return result.IsServerError ? this.StatusCode(500, body) : this.BadRequest(body);
    }

    // ==========================================
    // 4. POST: /periods/select/{id} (Set Active/Viewing)
    // ==========================================
    [HttpPost("select/{id:int}")]
    public async Task<IActionResult> SelectPeriod(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.periodsService.SelectPeriodAsync(userId, id);

        if (!result.Success)
        {
            if (result.NotFound)
            {
                return this.NotFound(new { success = false, message = result.Message });
            }

            return this.BadRequest(new { success = false, message = result.Message });
        }

        return this.Ok(new
        {
            success = true,
            selectedPeriodId = result.SelectedPeriodId,
            message = result.Message,
        });
    }

    // ==========================================
    // 5. POST: /periods/clear-selection (Stop Viewing)
    // ==========================================
    [HttpPost("clear-selection")]
    public async Task<IActionResult> ClearSelection()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.periodsService.ClearSelectionAsync(userId);
        return this.Ok(new
        {
            success = result.Success,
            message = result.Message,
        });
    }

    // ==========================================
    // 6. POST: /periods/close/{id} (Close Period)
    // ==========================================
    [HttpPost("close/{id:int}")]
    public async Task<IActionResult> ClosePeriod(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.periodsService.ClosePeriodAsync(userId, id);

        if (!result.Success)
        {
            if (result.NotFound)
            {
                return this.NotFound(new { success = false, message = result.Message });
            }

            return this.BadRequest(new { success = false, message = result.Message });
        }

        return this.Ok(new
        {
            success = true,
            message = result.Message,
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? this.User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
