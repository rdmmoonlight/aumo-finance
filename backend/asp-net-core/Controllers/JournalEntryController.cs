namespace AumoBackend.Controllers;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Extensions;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/journal-entry")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class JournalEntryController : ControllerBase
{
    private readonly IJournalEntryService journalEntryService;
    private readonly IValidator<CreateJournalEntryRequest> createValidator;
    private readonly IValidator<UpdateJournalEntryRequest> updateValidator;
    private readonly IValidator<SearchDescriptionsQuery> searchValidator;
    private readonly IValidator<NextTransactionNumberQuery> nextNumberValidator;

    public JournalEntryController(
        IJournalEntryService journalEntryService,
        IValidator<CreateJournalEntryRequest> createValidator,
        IValidator<UpdateJournalEntryRequest> updateValidator,
        IValidator<SearchDescriptionsQuery> searchValidator,
        IValidator<NextTransactionNumberQuery> nextNumberValidator)
    {
        this.journalEntryService = journalEntryService;
        this.createValidator = createValidator;
        this.updateValidator = updateValidator;
        this.searchValidator = searchValidator;
        this.nextNumberValidator = nextNumberValidator;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        var entry = await this.journalEntryService.GetByIdAsync(userId, id);
        if (entry == null) return this.NotFound(new { success = false, message = "Journal entry not found." });

        return this.Ok(new { success = true, entry });
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryRequest request)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        var validation = await this.createValidator.ValidateAsync(request);
        if (!validation.IsValid) return this.BadRequest(validation.ToErrorResponse());

        try
        {
            var result = await this.journalEntryService.CreateAsync(userId, request.ToServiceRequest());
            return this.Ok(new
            {
                success = true,
                message = $"Journal entry {result.TransactionNumber} has been posted.",
                entryId = result.Id,
                transactionNumber = result.TransactionNumber,
            });
        }
        catch (Exception ex)
        {
            return this.HandleServiceException(ex);
        }
    }

    [HttpPut("edit/{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] UpdateJournalEntryRequest request)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        var validation = await this.updateValidator.ValidateAsync(request);
        if (!validation.IsValid) return this.BadRequest(validation.ToErrorResponse());

        try
        {
            await this.journalEntryService.UpdateAsync(userId, id, request.ToServiceRequest());
            var updatedEntry = await this.journalEntryService.GetByIdAsync(userId, id);

            return this.Ok(new
            {
                success = true,
                message = $"Journal entry {updatedEntry?.TransactionNumber} updated successfully.",
            });
        }
        catch (Exception ex)
        {
            return this.HandleServiceException(ex);
        }
    }

    [HttpDelete("delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        try
        {
            var existing = await this.journalEntryService.GetByIdAsync(userId, id);
            if (existing == null) return this.NotFound(new { success = false, message = "Journal entry not found." });

            string transactionNumber = existing.TransactionNumber;
            await this.journalEntryService.DeleteAsync(userId, id);

            return this.Ok(new
            {
                success = true,
                message = $"Journal entry {transactionNumber} deleted successfully.",
            });
        }
        catch (Exception ex)
        {
            return this.HandleServiceException(ex);
        }
    }

    [HttpGet("search-descriptions")]
    public async Task<IActionResult> SearchDescriptions([FromQuery] SearchDescriptionsQuery request)
    {
        var validation = await this.searchValidator.ValidateAsync(request);
        if (!validation.IsValid) return this.BadRequest(validation.ToErrorResponse());

        var q = request.Q ?? string.Empty;
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2) return this.Ok(Array.Empty<string>());

        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        var results = await this.journalEntryService.SearchLineDescriptionsAsync(userId, q.Trim());
        return this.Ok(results);
    }

    [HttpGet("next-transaction-number")]
    public async Task<IActionResult> GetNextTransactionNumber([FromQuery] NextTransactionNumberQuery request)
    {
        var validation = await this.nextNumberValidator.ValidateAsync(request);
        if (!validation.IsValid) return this.BadRequest(validation.ToErrorResponse());

        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty) return this.UnauthorizedUser();

        var journalType = request.JournalType ?? "General";
        string nextNumber = await this.journalEntryService.GetNextTransactionNumberAsync(userId, journalType, request.EntryDate);

        return this.Ok(new { success = true, transactionNumber = nextNumber });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? this.User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }

    private UnauthorizedObjectResult UnauthorizedUser() =>
        this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
}
