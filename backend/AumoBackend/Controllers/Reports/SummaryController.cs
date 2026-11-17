namespace AumoBackend.Controllers.Reports;

using AumoBackend.Services.Reports.Summary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/[controller]")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class SummaryController : ControllerBase
{
    private readonly ISummaryService summaryService;

    public SummaryController(ISummaryService summaryService)
    {
        this.summaryService = summaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await this.summaryService.GetSummaryAsync(this.User);
        if (summary == null)
        {
            return this.Unauthorized(new { success = false, message = "User session expired or invalid." });
        }

        var summaryData = new
        {
            selectedPeriodId = summary.SelectedPeriodId,
            totalJournal = summary.TotalJournal,
            activeCoa = summary.ActiveCoa,
            activePeriodName = summary.ActivePeriodName,
            isPeriodOpen = summary.IsPeriodOpen,
        };

        return this.Ok(new
        {
            success = true,
            data = summaryData,
            totalJournal = summary.TotalJournal,
            activeCoa = summary.ActiveCoa,
            activePeriodName = summary.ActivePeriodName,
            isPeriodOpen = summary.IsPeriodOpen,
        });
    }
}
