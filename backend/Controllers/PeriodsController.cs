using AumoBackend.Data;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Services.Periods;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/periods")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class PeriodsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPeriodsService _periodsService;
    private readonly IValidator<CreatePeriodRequest> _createPeriodValidator;

    public PeriodsController(
        AppDbContext db,
        IPeriodsService periodsService,
        IValidator<CreatePeriodRequest> createPeriodValidator)
    {
        _db = db;
        _periodsService = periodsService;
        _createPeriodValidator = createPeriodValidator;
    }

    // ==========================================
    // 1. GET: /periods (Period List & Selection Status)
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetPeriods()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var periodsData = await _db.Periods
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.StartDate)
            .Select(p => new
            {
                p.Id,
                p.PeriodName,
                p.StartDate,
                p.EndDate,
                p.IsClosed,
                p.IsSelected
            })
            .ToListAsync();

        var selectedPeriod = periodsData.FirstOrDefault(p => p.IsSelected);
        int? selectedPeriodId = selectedPeriod?.Id;

        // Fallback ke helper jika di DB belum ada yang bernilai IsSelected = true
        if (!selectedPeriodId.HasValue)
        {
            var selectedFromHelper = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
            selectedPeriodId = selectedFromHelper?.Id;
        }

        var periods = periodsData.Select(p => new
        {
            p.Id,
            p.PeriodName,
            p.StartDate,
            p.EndDate,
            p.IsClosed,
            IsSelected = selectedPeriodId.HasValue ? (p.Id == selectedPeriodId.Value) : p.IsSelected
        }).ToList();

        return Ok(new
        {
            success = true,
            selectedPeriodId = selectedPeriodId,
            periods = periods
        });
    }

    // ==========================================
    // 2. GET: /periods/open-info
    // ==========================================
    [HttpGet("open-info")]
    public async Task<IActionResult> GetOpenPeriodInfo()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var accounts = await _db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .OrderBy(a => a.ReferenceNumber)
            .ToListAsync();

        var permanentAccounts = accounts
            .Where(a => a.Type == "Assets" || a.Type == "Liabilities" || a.Type == "Equity")
            .Select(a => new { a.Id, a.ReferenceNumber, a.AccountName, a.Type, a.DisplayLabel })
            .ToList();

        var availableCashAndBank = accounts.Where(a => a.Role == "CashAndEquivalents")
            .Select(a => new { a.Id, a.ReferenceNumber, a.AccountName, a.DisplayLabel })
            .ToList();

        var availableRetainedEarnings = accounts.Where(a => a.Role == "RetainedEarnings")
            .Select(a => new { a.Id, a.ReferenceNumber, a.AccountName, a.DisplayLabel })
            .ToList();

        var hasExistingPermanentAccounts = availableCashAndBank.Any() && availableRetainedEarnings.Any();

        return Ok(new
        {
            success = true,
            hasExistingPermanentAccounts,
            availableCashAndBankAccounts = availableCashAndBank,
            availableRetainedEarningsAccounts = availableRetainedEarnings,
            permanentAccounts
        });
    }

    // ==========================================
    // 3. POST: /periods (Open New Period)
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> CreatePeriod([FromBody] CreatePeriodRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var validation = await _createPeriodValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(validation.ToErrorResponse());

        var result = await _periodsService.CreatePeriodAsync(userId, request);

        if (result.Success)
            return Ok(new { success = true, message = result.Message, periodId = result.PeriodId });

        var body = new { success = false, message = result.Message };
        return result.IsServerError ? StatusCode(500, body) : BadRequest(body);
    }

    // ==========================================
    // 4. POST: /periods/select/{id} (Set Active/Viewing)
    // ==========================================
    [HttpPost("select/{id:int}")]
    public async Task<IActionResult> SelectPeriod(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var entity = await _db.Periods.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (entity == null)
            return NotFound(new { success = false, message = "Accounting period not found." });

        // TAHAP 1: Reset SEMUA IsSelected milik user ini menjadi false
        await _db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        // TAHAP 2: Set HANYA 1 periode yang dipilih menjadi true
        await _db.Periods
            .Where(p => p.Id == id && p.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, true));

        // Sinkronisasi dengan helper session/cache
        await SelectedPeriodHelper.SelectPeriodAsync(_db, userId, entity.Id);

        return Ok(new
        {
            success = true,
            selectedPeriodId = entity.Id,
            message = $"Now viewing {entity.PeriodName}" + (entity.IsClosed ? " (Closed)." : ".")
        });
    }

    // ==========================================
    // 5. POST: /periods/clear-selection (Stop Viewing)
    // ==========================================
    [HttpPost("clear-selection")]
    public async Task<IActionResult> ClearSelection()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        // Set semua IsSelected milik user menjadi false
        await _db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        await SelectedPeriodHelper.ClearSelectionAsync(_db, userId);

        return Ok(new
        {
            success = true,
            message = "Period selection cleared."
        });
    }

    // ==========================================
    // 6. POST: /periods/close/{id} (Close Period)
    // ==========================================
    [HttpPost("close/{id:int}")]
    public async Task<IActionResult> ClosePeriod(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized(new { success = false, message = "User identity is invalid or expired." });

        var entity = await _db.Periods.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (entity == null)
            return NotFound(new { success = false, message = "Accounting period not found." });

        if (entity.IsClosed)
            return BadRequest(new { success = false, message = $"Period {entity.PeriodName} is already closed." });

        var hasEarlierOpenPeriod = await _db.Periods
            .AnyAsync(p => p.UserId == userId && p.Id != entity.Id && p.StartDate < entity.StartDate && !p.IsClosed);

        if (hasEarlierOpenPeriod)
            return BadRequest(new { success = false, message = $"Cannot close {entity.PeriodName}: an earlier period is still open. Close earlier periods first." });

        entity.IsClosed = true;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"Period {entity.PeriodName} has been closed. Transactions in this period are now locked."
        });
    }

    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdStr, out Guid userId) ? userId : Guid.Empty;
    }
}