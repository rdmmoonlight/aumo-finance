using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/reports/journals")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]

public class JournalController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJournalService _journalService;
    private readonly IFinancialReportService _reportService;

    public JournalController(AppDbContext db, IJournalService journalService, IFinancialReportService reportService)
    {
        _db = db;
        _journalService = journalService;
        _reportService = reportService;
    }

    // ==========================================
    // 1. GENERAL JOURNAL
    // GET: /reports/journals/general
    // ==========================================
    [HttpGet("general")]
    public async Task<IActionResult> GetGeneralJournal()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);

        // FIX 1: Ubah dari NotFound(404) menjadi Ok(200) agar RTK Query Frontend
        // bisa membaca payload { selectedPeriodName = null } dengan wajar tanpa melempar isError.
        if (selectedPeriod == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                isPeriodClosed = false,
                entries = Array.Empty<object>()
            });
        }

        var startUtc = selectedPeriod.StartDate.Date;
        var endUtc = selectedPeriod.EndDate.Date.AddDays(1).AddTicks(-1);

        var rows = await _db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == "General"
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        // 1 baris GeneralJournal = 1 baris jurnal; kelompokkan per JournalEntryId menjadi header + lines.
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
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd"),
                x.Header.CreatedAt,
                x.Header.UpdatedAt,
                lines = x.Lines.OrderBy(l => l.LineOrder).Select(l => new
                {
                    Id = l.LineId,
                    l.AccountId,
                    AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                    ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString() : "0",
                    l.LineDescription,
                    l.Debit,
                    l.Credit,
                    l.LineOrder
                }).ToList()
            })
            .ToList();

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = selectedPeriod.PeriodName,
            isPeriodClosed = selectedPeriod.IsClosed,
            entries = entries
        });
    }

    // ==========================================
    // 2. ADJUSTING JOURNAL
    // GET: /reports/journals/adjusting
    // ==========================================
    [HttpGet("adjusting")]
    public async Task<IActionResult> GetAdjustingJournal()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (selectedPeriod == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                isPeriodClosed = false,
                entries = Array.Empty<object>()
            });
        }

        var startUtc = selectedPeriod.StartDate.Date;
        var endUtc = selectedPeriod.EndDate.Date.AddDays(1).AddTicks(-1);

        var rows = await _db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == "Adjusting"
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        // 1 baris GeneralJournal = 1 baris jurnal; kelompokkan per JournalEntryId menjadi header + lines.
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
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd"),
                x.Header.CreatedAt,
                x.Header.UpdatedAt,
                lines = x.Lines.OrderBy(l => l.LineOrder).Select(l => new
                {
                    Id = l.LineId,
                    l.AccountId,
                    AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                    ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString() : "0",
                    l.LineDescription,
                    l.Debit,
                    l.Credit,
                    l.LineOrder
                }).ToList()
            })
            .ToList();

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = selectedPeriod.PeriodName,
            isPeriodClosed = selectedPeriod.IsClosed,
            entries = entries
        });
    }

    // DELETE: /reports/journals/adjusting/{id}
    [HttpDelete("adjusting/{id:int}")]
    public async Task<IActionResult> DeleteAdjustingJournal(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        // id = JournalEntryId (id kelompok jurnal)
        var rows = await _db.GeneralJournals
            .Where(g => g.JournalEntryId == id && g.UserId == userId && g.JournalType == "Adjusting")
            .ToListAsync();

        if (rows.Count == 0)
        {
            return NotFound(new { success = false, message = "Adjusting journal entry not found." });
        }

        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (selectedPeriod != null && selectedPeriod.IsClosed)
        {
            return BadRequest(new { success = false, message = "Cannot delete entry in a closed accounting period." });
        }

        _db.GeneralJournals.RemoveRange(rows);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Adjusting journal entry deleted successfully." });
    }

    // ==========================================
    // 3. CLOSING JOURNAL
    // GET: /reports/journals/closing
    // ==========================================
    [HttpGet("closing")]
    public async Task<IActionResult> GetClosingJournal()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return Ok(new
            {
                success = true,
                hasPeriodSelected = false,
                message = "No accounting period selected.",
                selectedPeriodName = (string?)null,
                closingJournal = (object?)null
            });
        }

        var groups = await _journalService.BuildClosingJournalGroupsAsync(_db, userId, period, _reportService);
        var rows = await TrialBalanceController.BuildTrialBalanceRowsAsync(_db, userId, period, true);
        var incomeStatement = _reportService.BuildIncomeStatement(rows, period);
        var reAccountName = rows.Find(r => r.Role == "RetainedEarnings")?.AccountName ?? "Retained Earnings";

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            closingJournal = new
            {
                netIncome = incomeStatement.NetIncome,
                retainedEarningsAccountName = reAccountName,
                groups = groups.Select(g => new
                {
                    description = g.Description,
                    totalDebit = g.TotalDebit,
                    totalCredit = g.TotalCredit,
                    lines = g.Lines.Select(l => new
                    {
                        referenceNumber = l.ReferenceNumber,
                        accountName = l.AccountName,
                        debit = l.Debit,
                        credit = l.Credit
                    })
                })
            }
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
