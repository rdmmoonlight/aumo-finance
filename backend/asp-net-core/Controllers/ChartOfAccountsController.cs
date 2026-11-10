namespace AumoBackend.Controllers;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Services.ChartOfAccounts;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/chart-of-accounts")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class ChartOfAccountsController : ControllerBase
{
    private readonly IChartOfAccountsService chartOfAccountsService;
    private readonly IValidator<CreateAccountRequest> createAccountValidator;
    private readonly IValidator<UpdateAccountRequest> updateAccountValidator;
    private readonly IValidator<GetAccountsQuery> getAccountsValidator;

    public ChartOfAccountsController(
        IChartOfAccountsService chartOfAccountsService,
        IValidator<CreateAccountRequest> createAccountValidator,
        IValidator<UpdateAccountRequest> updateAccountValidator,
        IValidator<GetAccountsQuery> getAccountsValidator)
    {
        this.chartOfAccountsService = chartOfAccountsService;
        this.createAccountValidator = createAccountValidator;
        this.updateAccountValidator = updateAccountValidator;
        this.getAccountsValidator = getAccountsValidator;
    }

    // ==========================================
    // 1. GET: /chart-of-accounts
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetAccounts([FromQuery] GetAccountsQuery filter)
    {
        var validation = await this.getAccountsValidator.ValidateAsync(filter);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.chartOfAccountsService.GetAccountsAsync(userId, filter.Search, filter.Category);
        return this.Ok(result);
    }

    // ==========================================
    // 2. POST: /chart-of-accounts
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var validation = await this.createAccountValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var result = await this.chartOfAccountsService.CreateAccountAsync(userId, request);
        if (!result.IsSuccess)
        {
            return this.BadRequest(new { success = false, message = result.Message });
        }

        return this.Ok(new
        {
            success = true,
            message = result.Message,
            accountId = result.AccountId,
        });
    }

    // ==========================================
    // 3. PUT: /chart-of-accounts/{id}
    // ==========================================
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountRequest request)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var validation = await this.updateAccountValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var result = await this.chartOfAccountsService.UpdateAccountAsync(userId, id, request);
        if (!result.IsSuccess)
        {
            if (result.IsNotFound)
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

    // ==========================================
    // 4. DELETE: /chart-of-accounts/{id}
    // ==========================================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAccount(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var result = await this.chartOfAccountsService.DeleteAccountAsync(userId, id);
        if (!result.IsSuccess)
        {
            if (result.IsNotFound)
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
