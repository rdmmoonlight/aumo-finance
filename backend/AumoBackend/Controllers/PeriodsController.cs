namespace AumoBackend.Controllers;

using AumoBackend.DTOs;
using AumoBackend.Extensions;
using AumoBackend.Services.Periods;
using AumoBackend.Validators.Common;
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

    // GET: /periods (daftar periode dan status pilihan)
    [HttpGet]
    public async Task<IActionResult> GetPeriods()
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
        }

        return this.Ok(await this.periodsService.GetPeriodsAsync(userId));
    }

    // GET: /periods/open-info
    [HttpGet("open-info")]
    public async Task<IActionResult> GetOpenPeriodInfo()
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
        }

        return this.Ok(await this.periodsService.GetOpenPeriodInfoAsync(userId));
    }

    // POST: /periods (buka periode baru)
    [HttpPost]
    public async Task<IActionResult> CreatePeriod([FromBody] CreatePeriodRequest request)
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
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

    // POST: /periods/select/{id} (pilih periode untuk dilihat)
    [HttpPost("select/{id:int}")]
    public async Task<IActionResult> SelectPeriod(int id)
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
        }

        var result = await this.periodsService.SelectPeriodAsync(userId, id);
        if (result == null)
        {
            return this.NotFound(new { success = false, message = "Accounting period not found." });
        }

        return this.Ok(new { success = true, selectedPeriodId = result.SelectedPeriodId, message = result.Message });
    }

    // POST: /periods/clear-selection (berhenti melihat periode)
    [HttpPost("clear-selection")]
    public async Task<IActionResult> ClearSelection()
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
        }

        var result = await this.periodsService.ClearSelectionAsync(userId);
        return this.Ok(new { success = result.Success, message = result.Message });
    }

    // POST: /periods/close/{id} (tutup periode)
    [HttpPost("close/{id:int}")]
    public async Task<IActionResult> ClosePeriod(int id)
    {
        var userId = this.User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.InvalidIdentity();
        }

        var result = await this.periodsService.ClosePeriodAsync(userId, id);
        var body = new { success = result.Success, message = result.Message };

        if (result.Success)
        {
            return this.Ok(body);
        }

        return result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)
            ? this.NotFound(body)
            : this.BadRequest(body);
    }

    private IActionResult InvalidIdentity()
    {
        return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
    }
}
