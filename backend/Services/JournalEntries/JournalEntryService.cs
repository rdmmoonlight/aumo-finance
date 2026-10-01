using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Periods;
using AumoBackend.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services.JournalEntries;

public class JournalEntryService : IJournalEntryService
{
    private readonly AppDbContext _db;
    private readonly ITransactionNumberService _transactionNumberService;

    public JournalEntryService(AppDbContext db, ITransactionNumberService transactionNumberService)
    {
        _db = db;
        _transactionNumberService = transactionNumberService;
    }

    public async Task<JournalEntryResponseDto?> GetByIdAsync(Guid userId, int id)
    {
        var entry = await _db.JournalEntries
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (entry == null) return null;

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        bool isLocked = PeriodLock.IsDateLocked(entry.EntryDate, closedPeriods);

        return new JournalEntryResponseDto
        {
            Id = entry.Id,
            TransactionNumber = entry.TransactionNumber,
            JournalType = entry.JournalType,
            EntryDate = entry.EntryDate,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt,
            IsLocked = isLocked,
            Lines = entry.Lines.OrderBy(l => l.LineOrder).Select(l => new JournalEntryLineResponseDto
            {
                Id = l.Id,
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = l.LineOrder
            }).ToList()
        };
    }

    public async Task<CreateJournalEntryResponseDto> CreateAsync(Guid userId, CreateJournalEntryRequest request)
    {
        var effectiveLines = ValidateAndExtractLines(request.Lines);
        await ValidateAccountsAsync(userId, effectiveLines);

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        if (PeriodLock.IsDateLocked(request.EntryDate, closedPeriods))
        {
            throw new InvalidOperationException("This date falls within a closed accounting period. Choose a date in an open period.");
        }

        string journalType = string.IsNullOrWhiteSpace(request.JournalType) ? "General" : request.JournalType;
        string transactionNumber = await _transactionNumberService.GenerateAsync(userId, journalType, request.EntryDate);

        var deviceCreatedAt = request.CreatedAt == default ? DateTime.UtcNow : request.CreatedAt;

        var entry = new JournalEntry
        {
            UserId = userId,
            TransactionNumber = transactionNumber,
            JournalType = journalType,
            EntryDate = DateTime.SpecifyKind(request.EntryDate, DateTimeKind.Utc),
            CreatedAt = DateTime.SpecifyKind(deviceCreatedAt, DateTimeKind.Utc),
            Lines = effectiveLines.Select((l, index) => new JournalEntryLine
            {
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = index
            }).ToList()
        };

        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync();

        return new CreateJournalEntryResponseDto
        {
            EntryId = entry.Id,
            TransactionNumber = entry.TransactionNumber,
            Message = $"Journal entry {entry.TransactionNumber} has been posted."
        };
    }

    public async Task UpdateAsync(Guid userId, int id, UpdateJournalEntryRequest request)
    {
        var entry = await _db.JournalEntries
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (entry == null)
        {
            throw new KeyNotFoundException("Journal entry not found.");
        }

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        if (PeriodLock.IsDateLocked(entry.EntryDate, closedPeriods) || PeriodLock.IsDateLocked(request.EntryDate, closedPeriods))
        {
            throw new InvalidOperationException($"Journal entry {entry.TransactionNumber} falls within a closed period and cannot be modified.");
        }

        var effectiveLines = ValidateAndExtractLines(request.Lines);
        await ValidateAccountsAsync(userId, effectiveLines);

        entry.JournalType = string.IsNullOrWhiteSpace(request.JournalType) ? entry.JournalType : request.JournalType;
        entry.EntryDate = DateTime.SpecifyKind(request.EntryDate, DateTimeKind.Utc);

        var deviceUpdatedAt = request.UpdatedAt == default ? DateTime.UtcNow : request.UpdatedAt;
        entry.UpdatedAt = DateTime.SpecifyKind(deviceUpdatedAt, DateTimeKind.Utc);

        _db.JournalEntryLines.RemoveRange(entry.Lines);

        entry.Lines = effectiveLines.Select((l, index) => new JournalEntryLine
        {
            JournalEntryId = entry.Id,
            AccountId = l.AccountId,
            LineDescription = l.LineDescription,
            Debit = l.Debit,
            Credit = l.Credit,
            LineOrder = index
        }).ToList();

        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid userId, int id)
    {
        var entry = await _db.JournalEntries
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (entry == null)
        {
            throw new KeyNotFoundException("Journal entry not found.");
        }

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        if (PeriodLock.IsDateLocked(entry.EntryDate, closedPeriods))
        {
            throw new InvalidOperationException("Cannot delete transactions in closed accounting periods.");
        }

        _db.JournalEntries.Remove(entry);
        await _db.SaveChangesAsync();
    }

    public async Task<List<string>> SearchDescriptionsAsync(Guid userId, string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return new List<string>();
        }

        var keyword = query.Trim();

        return await _db.JournalEntryLines
            .Include(l => l.JournalEntry)
            .Where(l => l.JournalEntry!.UserId == userId
                     && l.LineDescription != null && l.LineDescription != ""
                     && EF.Functions.ILike(l.LineDescription, $"%{keyword}%"))
            .GroupBy(l => l.LineDescription)
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Max(l => l.Id))
            .Select(g => g.Key!)
            .Take(8)
            .ToListAsync();
    }

    public async Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate)
    {
        string type = string.IsNullOrWhiteSpace(journalType) ? "General" : journalType;
        return await _transactionNumberService.PeekNextAsync(userId, type, entryDate ?? DateTime.Today);
    }

    private static List<JournalEntryLineDto> ValidateAndExtractLines(List<JournalEntryLineDto> lines)
    {
        var effectiveLines = lines
            .Where(l => l.AccountId != 0 && (l.Debit != 0 || l.Credit != 0))
            .ToList();

        if (effectiveLines.Count < 2)
        {
            throw new ArgumentException("A journal entry must have at least two line items.");
        }

        var totalDebit = effectiveLines.Sum(l => l.Debit);
        var totalCredit = effectiveLines.Sum(l => l.Credit);

        if (totalDebit != totalCredit || totalDebit == 0)
        {
            throw new ArgumentException("Total debit must equal total credit before posting.");
        }

        return effectiveLines;
    }

    private async Task ValidateAccountsAsync(Guid userId, List<JournalEntryLineDto> lines)
    {
        var validAccountIds = (await _db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync())
            .ToHashSet();

        if (lines.Any(l => !validAccountIds.Contains(l.AccountId)))
        {
            throw new ArgumentException("One or more selected accounts are invalid or inactive.");
        }
    }
}
