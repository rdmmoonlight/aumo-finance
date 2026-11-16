namespace AumoBackend.Controllers;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Services.Dashboard;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/dashboard")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService dashboardService;
    private readonly IValidator<GetDashboardQuery> queryValidator;

    public DashboardController(
        IDashboardService dashboardService,
        IValidator<GetDashboardQuery> queryValidator)
    {
        this.dashboardService = dashboardService;
        this.queryValidator = queryValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData([FromQuery] GetDashboardQuery query)
    {
        var validation = await this.queryValidator.ValidateAsync(query);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var period = query.Period ?? "monthly";

        var dashboardData = await this.dashboardService.GetDashboardDataAsync(userId, period);

        return this.Ok(dashboardData);
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? this.User.FindFirstValue("sub");
        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
