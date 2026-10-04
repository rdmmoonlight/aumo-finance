using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Reports.GeneralLedgers;
using AumoBackend.Models;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Controllers.Reports;

[ApiController]
[Route("/api/v1/reports/general-ledgers")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class GeneralLedgerController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IGeneralLedgersService _glService;

    public GeneralLedgerController(AppDbContext db, IGeneralLedgersService glService)
    {
        _db = db;
        _glService = glService;
    }

    // ==========================================
    // 1. GET: /api/v1/reports/general-ledgers/permanent
    // ==========================================
    [HttpGet("permanent")]
    public async Task<IActionResult> GetPermanentGeneralLedger()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return NotFound(new
            {
                success = false,
                hasPeriodSelected = false,
                message = "No accounting period selected."
            });
        }

        // Ambil data langsung dari DbSet PermanentAccountsGeneralLedger
        var ledgers = await _db.PermanentAccountsGeneralLedger
            .AsNoTracking()
            .Include(x => x.Account)
            .Where(x => x.UserId == userId && x.PeriodId == period.Id)
            .OrderBy(x => x.AccountId)
            .ThenBy(x => x.EntryDate)
            .ThenBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.AccountId,
                AccountName = x.Account != null ? x.Account.AccountName : string.Empty,
                AccountReferenceNumber = x.Account != null ? x.Account.ReferenceNumber : 0,
                x.JournalEntryId,
                x.JournalEntryLineId,
                x.EntryDate,
                x.TransactionNumber,
                x.LineDescription,
                x.Debit,
                x.Credit,
                x.RunningBalance
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            isTemporary = false,
            ledgers = ledgers
        });
    }

    // ==========================================
    // 2. GET: /api/v1/reports/general-ledgers/temporary
    // ==========================================
    [HttpGet("temporary")]
    public async Task<IActionResult> GetTemporaryGeneralLedger()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return NotFound(new
            {
                success = false,
                hasPeriodSelected = false,
                message = "No accounting period selected."
            });
        }

        // Ambil data langsung dari DbSet TemporaryAccountsGeneralLedger
        var ledgers = await _db.TemporaryAccountsGeneralLedger
            .AsNoTracking()
            .Include(x => x.Account)
            .Where(x => x.UserId == userId && x.PeriodId == period.Id)
            .OrderBy(x => x.AccountId)
            .ThenBy(x => x.EntryDate)
            .ThenBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.AccountId,
                AccountName = x.Account != null ? x.Account.AccountName : string.Empty,
                AccountReferenceNumber = x.Account != null ? x.Account.ReferenceNumber : 0,
                AccountType = x.Account != null ? x.Account.Type : string.Empty,
                x.JournalEntryId,
                x.JournalEntryLineId,
                x.EntryDate,
                x.TransactionNumber,
                x.LineDescription,
                x.Debit,
                x.Credit,
                x.RunningBalance
            })
            .ToListAsync();

        // Hitung total Laba/Rugi sebelum penutupan (Revenue - Expenses)
        decimal totalRevenue = ledgers.Where(x => x.AccountType == "OperatingIncome" || x.AccountType == "OtherIncome").Sum(x => x.Credit - x.Debit);
        decimal totalExpense = ledgers.Where(x => x.AccountType == "OperatingExpenses" || x.AccountType == "OtherExpenses").Sum(x => x.Debit - x.Credit);
        decimal netTotal = totalRevenue - totalExpense;

        return Ok(new
        {
            success = true,
            hasPeriodSelected = true,
            selectedPeriodName = period.PeriodName,
            isTemporary = true,
            netIncomeBeforeClosing = netTotal,
            ledgers = ledgers
        });
    }

    // ==========================================
    // 3. POST: /api/v1/reports/general-ledgers/refresh
    // ==========================================
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshLedgerData()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var result = await _glService.RefreshGeneralLedgersAsync(userId);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}
