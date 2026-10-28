namespace AumoBackend.Controllers.Reports;

using AumoBackend.Extensions;
using AumoBackend.Services.Reports.Worksheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/reports/worksheet")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class WorksheetController : ControllerBase
{
    private readonly IWorksheetService _worksheetService;
    public WorksheetController(IWorksheetService worksheetService) => _worksheetService = worksheetService;

    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        var userId = User.GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(new { success = false, message = "User identity is invalid" });

        var result = await _worksheetService.GetWorksheetAsync(userId);
        return Ok(result);
    }
}