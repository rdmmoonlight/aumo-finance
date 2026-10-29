using System.Security.Claims;
using AumoBackend.Data;
using AumoBackend.Helpers;
using AumoBackend.Services.Reports.Journals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/reports/journals")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class JournalsController : ControllerBase
{
    private readonly AppDbContext db;
    private readonly IJournalsService journalService;

    public JournalsController(AppDbContext db, IJournalsService journalsService)
    {
        this.db = db;
        this.journalService = journalsService;
    }

    // ==========================================
    // 1. GENERAL JOURNAL
    // GET: /reports/journals/general
    // ==========================================
    [HttpGet("general")]
    public async Task<IActionResult> GetGeneralJournal()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(this.db, userId);

        if (selectedPeriod == null)
        {
            return this.Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                isPeriodClosed = false,
                entries = Array.Empty<object>(),
            });
        }

        var startUtc = DateTime.SpecifyKind(selectedPeriod.StartDate.Date, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(selectedPeriod.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var rows = await this.db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == "General"
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        var entries = rows
            .GroupBy(g => g.JournalEntryId)
            .Select(grp => new { Header = grp.First(), Lines = grp })
            .OrderBy(x => x.Header.EntryDate)
            .ThenBy(x => x.Header.CreatedAt)
            .ThenBy(x => x.Header.JournalEntryId)
            .Select(x => new
            {
                Id = x.Header.JournalEntryId,
                x.Header.TransactionNumber,
                x.Header.JournalType,
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
                x.Header.CreatedAt,
                x.Header.UpdatedAt,
                lines = x.Lines.OrderBy(l => l.LineOrder).Select(l => new
                {
                    Id = l.LineId,
                    l.AccountId,
                    AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                    ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString(System.Globalization.CultureInfo.InvariantCulture) : "0",
                    l.LineDescription,
                    l.Debit,
                    l.Credit,
                    l.LineOrder
                }).ToList(),
            })
            .ToList();

        return this.Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = selectedPeriod.PeriodName,
            isPeriodClosed = selectedPeriod.IsClosed,
            entries = entries,
        });
    }

    // ==========================================
    // 2. ADJUSTING JOURNAL
    // GET: /reports/journals/adjusting
    // ==========================================
    [HttpGet("adjusting")]
    public async Task<IActionResult> GetAdjustingJournal()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(this.db, userId);
        if (selectedPeriod == null)
        {
            return this.Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                isPeriodClosed = false,
                entries = Array.Empty<object>(),
            });
        }

        var startUtc = DateTime.SpecifyKind(selectedPeriod.StartDate.Date, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(selectedPeriod.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var rows = await this.db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == "Adjusting"
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        var entries = rows
            .GroupBy(g => g.JournalEntryId)
            .Select(grp => new { Header = grp.First(), Lines = grp })
            .OrderBy(x => x.Header.EntryDate)
            .ThenBy(x => x.Header.CreatedAt)
            .ThenBy(x => x.Header.JournalEntryId)
            .Select(x => new
            {
                Id = x.Header.JournalEntryId,
                x.Header.TransactionNumber,
                x.Header.JournalType,
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
                x.Header.CreatedAt,
                x.Header.UpdatedAt,
                lines = x.Lines.OrderBy(l => l.LineOrder).Select(l => new
                {
                    Id = l.LineId,
                    l.AccountId,
                    AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                    ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString(System.Globalization.CultureInfo.InvariantCulture) : "0",
                    l.LineDescription,
                    l.Debit,
                    l.Credit,
                    l.LineOrder
                }).ToList(),
            })
            .ToList();

        return this.Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = selectedPeriod.PeriodName,
            isPeriodClosed = selectedPeriod.IsClosed,
            entries = entries,
        });
    }

    // DELETE: /reports/journals/adjusting/{id}
    [HttpDelete("adjusting/{id:int}")]
    public async Task<IActionResult> DeleteAdjustingJournal(int id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var rows = await this.db.GeneralJournals
            .Where(g => g.JournalEntryId == id && g.UserId == userId && g.JournalType == "Adjusting")
            .ToListAsync();

        if (rows.Count == 0)
        {
            return this.NotFound(new { success = false, message = "Adjusting journal entry not found." });
        }

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(this.db, userId);
        if (selectedPeriod != null && selectedPeriod.IsClosed)
        {
            return this.BadRequest(new { success = false, message = "Cannot delete entry in a closed accounting period." });
        }

        this.db.GeneralJournals.RemoveRange(rows);
        await this.db.SaveChangesAsync();

        return this.Ok(new { success = true, message = "Adjusting journal entry deleted successfully." });
    }

    // ==========================================
    // 3. CLOSING JOURNAL
    // GET: /reports/journals/closing
    // ==========================================
    [HttpGet("closing")]
    public async Task<IActionResult> GetClosingJournal()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized(new { success = false, message = "User identity is invalid or expired." });
        }

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(this.db, userId);
        if (period == null)
        {
            return this.Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                closingJournal = Array.Empty<object>(),
            });
        }

        var startUtc = DateTime.SpecifyKind(period.StartDate.Date, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(period.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var rows = await this.db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == "Closing"
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        var closingJournal = rows
            .GroupBy(g => g.JournalEntryId)
            .Select(grp => new { Header = grp.First(), Lines = grp })
            .OrderBy(x => x.Header.EntryDate)
            .ThenBy(x => x.Header.CreatedAt)
            .ThenBy(x => x.Header.JournalEntryId)
            .Select(x => new
            {
                Id = x.Header.JournalEntryId,
                x.Header.TransactionNumber,
                x.Header.JournalType,
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
                x.Header.CreatedAt,
                x.Header.UpdatedAt,
                lines = x.Lines.OrderBy(l => l.LineOrder).Select(l => new
                {
                    Id = l.LineId,
                    l.AccountId,
                    AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                    ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString(System.Globalization.CultureInfo.InvariantCulture) : "0",
                    l.LineDescription,
                    l.Debit,
                    l.Credit,
                    l.LineOrder
                }).ToList(),
            })
            .ToList();

        return this.Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            isPeriodClosed = period.IsClosed,
            closingJournal = closingJournal,
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? this.User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}