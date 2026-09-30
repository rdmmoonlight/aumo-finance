using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AumoBackend.DTOs;
using AumoBackend.Services;

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

        // 1. Cari periode yang sedang dipilih oleh user (IsSelected == true)
        var selectedPeriod = await _context.Periods
           .AsNoTracking()
           .Where(p => p.UserId == userId && p.IsSelected)
           .Select(p => new
           {
               p.Id,
               p.PeriodName,
               p.StartDate,
               p.EndDate,
               p.IsClosed
           })
           .FirstOrDefaultAsync();

        // 2. Query JournalEntries filtered berdasarkan rentang tanggal periode yang dipilih (jika ada)
        var journalQuery = _context.JournalEntries
           .AsNoTracking()
           .Where(j => j.UserId == userId);

        if (selectedPeriod != null)
        {
            journalQuery = journalQuery.Where(j => j.EntryDate >= selectedPeriod.StartDate && j.EntryDate <= selectedPeriod.EndDate);
        }

        var journalCount = await journalQuery.CountAsync();

        // 3. Hitung Active COA
        var activeCoaCount = await _context.ChartOfAccounts
           .AsNoTracking()
           .CountAsync(c => c.UserId == userId && c.IsActive);

        var activePeriodName = selectedPeriod?.PeriodName ?? "Tidak Ada Periode Aktif";
        var isPeriodOpen = selectedPeriod != null && !selectedPeriod.IsClosed;

        var summaryData = new
        {
            selectedPeriodId = selectedPeriod?.Id,
            totalJournal = journalCount,
            activeCoa = activeCoaCount,
            activePeriodName = activePeriodName,
            isPeriodOpen = isPeriodOpen
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
