using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Core; // <--- DITAMBAHKAN (Namespace tempat AppDbContext & ApplicationUser berada)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        // 1. Ambil User ID aktif (Mendukung Cookie & JWT Bearer)
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

        // 2. Query Paralel untuk efisiensi database (Setara Promise.all)
        var journalCountTask = _context.JournalEntries
            .CountAsync(j => j.UserId == userId);

        var activeCoaCountTask = _context.ChartOfAccounts
            .CountAsync(c => c.UserId == userId && c.IsActive);

        var activePeriodTask = _context.Periods
            .Where(p => p.UserId == userId && !p.IsClosed && p.IsSelected)
            .Select(p => new 
            { 
                p.PeriodName, 
                p.IsClosed 
            })
            .FirstOrDefaultAsync();

        // Tunggu semua query selesai dieksekusi bersamaan
        await Task.WhenAll(journalCountTask, activeCoaCountTask, activePeriodTask);

        var journalCount = await journalCountTask;
        var activeCoaCount = await activeCoaCountTask;
        var activePeriod = await activePeriodTask;

        // 3. Output Response
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
