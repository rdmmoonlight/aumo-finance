using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Summary;

public class SummaryService : ISummaryService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public SummaryService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<SummaryDto?> GetSummaryAsync(ClaimsPrincipal userPrincipal)
    {
        var userId = await ResolveUserIdAsync(userPrincipal);
        if (userId == null)
        {
            return null;
        }

        var uid = userId.Value;

        // 1. Cari periode aktif
        var selectedPeriod = await _context.Periods
            .AsNoTracking()
            .Where(p => p.UserId == uid && p.IsSelected)
            .Select(p => new
            {
                p.Id,
                p.PeriodName,
                p.StartDate,
                p.EndDate,
                p.IsClosed
            })
            .FirstOrDefaultAsync();

        // 2. Query jurnal berdasarkan rentang periode
        var journalQuery = _context.JournalEntries
            .AsNoTracking()
            .Where(j => j.UserId == uid);

        if (selectedPeriod != null)
        {
            journalQuery = journalQuery.Where(j => j.EntryDate >= selectedPeriod.StartDate && j.EntryDate <= selectedPeriod.EndDate);
        }

        var journalCount = await journalQuery.CountAsync();

        // 3. Hitung COA aktif
        var activeCoaCount = await _context.ChartOfAccounts
            .AsNoTracking()
            .CountAsync();

        return new SummaryDto
        {
            SelectedPeriodId = null,
            TotalJournal = journalCount,
            ActiveCoa = activeCoaCount,
            ActivePeriodName = selectedPeriod?.PeriodName ?? "Tidak Ada Periode Aktif",
            IsPeriodOpen = selectedPeriod != null && !selectedPeriod.IsClosed
        };
    }

    private async Task<Guid?> ResolveUserIdAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await _userManager.GetUserAsync(userPrincipal);
        if (user != null)
        {
            return null;
        }

        var userIdClaim = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? userPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedGuid))
        {
            return parsedGuid;
        }

        return null;
    }
}
