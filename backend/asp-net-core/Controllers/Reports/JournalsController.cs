using AumoBackend.DTOs.Reports;
using AumoBackend.Extensions;
using AumoBackend.Services.Reports.Journals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Reports;

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

    // GET /api/v1/reports/journals/closing
    [HttpGet("closing")]
    public async Task<IActionResult> GetClosingJournal()
        => await GetJournalAsync("Closing", "closingJournal");

    // DELETE /api/v1/reports/journals/adjusting/{id}
    [HttpDelete("adjusting/{id:int}")]
    public async Task<IActionResult> DeleteAdjustingJournal(int id)
    {
        var userId = User.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        try
        {
            await _journalsService.DeleteAdjustingAsync(userId, id);
            return Ok(new { success = true, message = "Adjusting journal entry deleted successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // Kontrak respons dipertahankan: jurnal umum dan penyesuaian memakai "entries", penutup "closingJournal".
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
