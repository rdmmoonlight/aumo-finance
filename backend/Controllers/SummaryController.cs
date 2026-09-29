using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AumoBackend.Core;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class SummaryController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public SummaryController(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetSummary()
    {
        var user = await _userManager.GetUserAsync(User);

        Guid userId;
        if (user != null)
        {
            userId = user.Id;
        }
        else
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out userId))
            {
                return Unauthorized(new { success = false, message = "User session expired or invalid." });
            }
        }

        // FIX: Jangan pakai Task.WhenAll di 1 DbContext. Sequential aja, ini udah cepet.
        var journalCount = await _context.JournalEntries
           .AsNoTracking()
           .CountAsync(j => j.UserId == userId);

        var activeCoaCount = await _context.ChartOfAccounts
           .AsNoTracking()
           .CountAsync(c => c.UserId == userId && c.IsActive);

        var activePeriod = await _context.Periods
           .AsNoTracking()
           .Where(p => p.UserId == userId && !p.IsClosed && p.IsSelected)
           .Select(p => new
           {
               p.PeriodName,
               p.IsClosed
           })
           .FirstOrDefaultAsync();

        var summaryData = new
        {
            totalJournal = journalCount,
            activeCoa = activeCoaCount,
            activePeriodName = activePeriod?.PeriodName ?? "Tidak Ada Periode Aktif",
            isPeriodOpen = activePeriod != null && !activePeriod.IsClosed
        };

        return Ok(new
        {
            success = true,
            data = summaryData,
            totalJournal = journalCount,
            activeCoa = activeCoaCount,
            activePeriodName = summaryData.activePeriodName,
            isPeriodOpen = summaryData.isPeriodOpen
        });
    }
}
