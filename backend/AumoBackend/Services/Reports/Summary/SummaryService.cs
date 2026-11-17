namespace AumoBackend.Services.Reports.Summary;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class SummaryService : ISummaryService
{
    private readonly AppDbContext context;
    private readonly UserManager<ApplicationUser> userManager;

    public SummaryService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        this.context = context;
        this.userManager = userManager;
    }

    public async Task<SummaryDto?> GetSummaryAsync(ClaimsPrincipal userPrincipal)
    {
        var userId = await this.ResolveUserIdAsync(userPrincipal);
        if (userId == null)
        {
            return null;
        }

        var uid = userId.Value;

        // 1. Cari periode yang sedang dipilih oleh user (IsSelected == true)
        var selectedPeriod = await this.context.Periods
            .AsNoTracking()
            .Where(p => p.UserId == uid && p.IsSelected)
            .Select(p => new
            {
                p.Id,
                p.PeriodName,
                p.StartDate,
                p.EndDate,
                p.IsClosed,
            })
            .FirstOrDefaultAsync();

        // 2. Query GeneralJournal berdasarkan rentang tanggal periode yang dipilih (jika ada)
        var journalQuery = this.context.GeneralJournals
            .AsNoTracking()
            .Where(j => j.UserId == uid);

        if (selectedPeriod != null)
        {
            journalQuery = journalQuery.Where(j => j.EntryDate >= selectedPeriod.StartDate && j.EntryDate <= selectedPeriod.EndDate);
        }

        var journalCount = await journalQuery.Select(j => j.JournalEntryId).Distinct().CountAsync();

        // 3. Hitung COA aktif milik user
        var activeCoaCount = await this.context.ChartOfAccounts
            .AsNoTracking()
            .CountAsync(c => c.UserId == uid && c.IsActive);

        return new SummaryDto
        {
            SelectedPeriodId = selectedPeriod?.Id,
            TotalJournal = journalCount,
            ActiveCoa = activeCoaCount,
            ActivePeriodName = selectedPeriod?.PeriodName ?? "Tidak Ada Periode Aktif",
            IsPeriodOpen = selectedPeriod != null && !selectedPeriod.IsClosed,
        };
    }

    private async Task<Guid?> ResolveUserIdAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user != null)
        {
            return user.Id;
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
