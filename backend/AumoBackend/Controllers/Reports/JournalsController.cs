namespace AumoBackend.Controllers.Reports;

using AumoBackend.DTOs.Reports;
using AumoBackend.Extensions;
using AumoBackend.Services.Reports.Journals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("reports/journals")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class JournalsController : ControllerBase
{
    private readonly IJournalsService _journalsService;

    public JournalsController(IJournalsService journalsService)
    {
        _journalsService = journalsService;
    }

    // GET /api/v1/reports/journals/general
    [HttpGet("general")]
    public async Task<IActionResult> GetGeneralJournal()
        => await GetJournalAsync("General", "entries");

    // GET /api/v1/reports/journals/adjusting
    [HttpGet("adjusting")]
    public async Task<IActionResult> GetAdjustingJournal()
        => await GetJournalAsync("Adjusting", "entries");

    // GET /api/v1/reports/journals/reversing
    [HttpGet("reversing")]
    public async Task<IActionResult> GetReversingJournal()
        => await GetJournalAsync("Reversing", "entries");

    // POST /api/v1/reports/journals/reversing
    [HttpPost("reversing")]
    public async Task<IActionResult> CreateReversingJournal([FromBody] CreateReversingRequest request)
    {
        var userId = User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        if (request == null || request.AdjustingEntryIds == null || request.AdjustingEntryIds.Count == 0)
        {
            return BadRequest(new { success = false, message = "AdjustingEntryIds is required and cannot be empty." });
        }

        try
        {
            var createdEntries = await _journalsService.CreateReversingAsync(userId, request);

            return Ok(new
            {
                success = true,
                entries = createdEntries
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // GET /api/v1/reports/journals/closing
    [HttpGet("closing")]
    public async Task<IActionResult> GetClosingJournal()
    {
        var userId = User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        ClosingJournalReportResult result = await _journalsService.GetClosingJournalAsync(userId);

        if (!result.HasPeriodSelected)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                selectedPeriodName = (string?)null,
                message = "No accounting period selected.",
                isPeriodClosed = false,
                closingJournal = (object?)null,
            });
        }

        if (!result.IsPeriodClosed)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = true,
                selectedPeriodName = result.SelectedPeriodName,
                message = "Accounting period is not closed yet.",
                isPeriodClosed = false,
                closingJournal = (object?)null,
            });
        }

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = result.SelectedPeriodName,
            isPeriodClosed = true,
            closingJournal = new
            {
                netIncome = result.NetIncome,
                retainedEarningsAccountName = result.RetainedEarningsAccountName,
                groups = result.Groups,
            },
        });
    }

    private async Task<IActionResult> GetJournalAsync(string journalType, string listKey)
    {
        var userId = User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        JournalReportResult result = await _journalsService.GetJournalAsync(userId, journalType);

        var body = new Dictionary<string, object?>
        {
            ["success"] = true,
            ["hasPeriodSelected"] = result.HasPeriodSelected,
            ["selectedPeriodName"] = result.SelectedPeriodName,
        };

        if (!result.HasPeriodSelected)
        {
            body["message"] = "No accounting period selected.";
        }

        if (listKey == "entries")
        {
            body["isPeriodClosed"] = result.IsPeriodClosed;
        }

        body[listKey] = result.Entries;
        if (listKey != "entries")
        {
            body["isPeriodClosed"] = result.IsPeriodClosed;
        }

        return Ok(body);
    }
}
