namespace AumoBackend.Controllers;

using System.Security.Claims;
using AumoBackend.DTOs;
using AumoBackend.Services.Tools;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/tools")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]

public class ToolsController : ControllerBase
{
    private readonly IToolsService toolsService;
    private readonly IValidator<JournalImportRequestDto> importValidator;

    public ToolsController(IToolsService toolsService, IValidator<JournalImportRequestDto> importValidator)
    {
        this.toolsService = toolsService;
        this.importValidator = importValidator;
    }

    // GET: /tools/download-journal-template
    [HttpGet("download-journal-template")]
    public IActionResult DownloadJournalTemplate()
    {
        var content = this.toolsService.GenerateJournalTemplate();

        return this.File(
            content,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "JournalImportTemplate.xlsx");
    }

    // POST: /tools/preview-journal-import
    [HttpPost("preview-journal-import")]
    public async Task<IActionResult> PreviewJournalImport([FromBody] JournalImportRequestDto request)
    {
        var validation = await this.importValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return this.Unauthorized();
        }

        var result = await this.toolsService.PreviewJournalImportAsync(userId, request);

        return this.Ok(new
        {
            transactions = result.Transactions,
            accountMappings = result.AccountMappings,
            summary = new
            {
                totalUniqueAccounts = result.Summary.TotalUniqueAccounts,
                exactMatchCount = result.Summary.ExactMatchCount,
                reallocatedCount = result.Summary.ReallocatedCount,
                unmappedCount = result.Summary.UnmappedCount,
                isPerfectMatch = result.Summary.IsPerfectMatch,
            },
        });
    }

    // POST: /tools/import-journal-entries
    [HttpPost("import-journal-entries")]
    public async Task<IActionResult> ImportJournalEntries([FromBody] JournalImportRequestDto request)
    {
        var validation = await this.importValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return this.Unauthorized();
        }

        try
        {
            var result = await this.toolsService.ImportJournalEntriesAsync(userId, request);

            return this.Ok(new
            {
                message = result.Message,
                importedEntriesCount = result.ImportedEntriesCount,
            });
        }
        catch (Exception ex)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, new { message = $"Failed to save data: {ex.Message}" });
        }
    }
}
