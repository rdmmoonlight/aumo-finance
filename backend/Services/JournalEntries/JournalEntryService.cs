using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
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

    public async Task<GeneralJournalResponseDto?> GetByIdAsync(Guid userId, int id)
    {
        // Membaca baris-baris detail dari tabel GeneralJournal berdasarkan JournalEntryId
        var rows = await _db.GeneralJournals
            .Where(gj => gj.JournalEntryId == id && gj.UserId == userId)
            .OrderBy(gj => gj.LineOrder)
            .ToListAsync();

        if (!rows.Any()) return null;

        var firstRow = rows.First();

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        bool isLocked = PeriodLock.IsDateLocked(firstRow.EntryDate, closedPeriods);

        return new GeneralJournalResponseDto
        {
            Id = firstRow.JournalEntryId,
            TransactionNumber = firstRow.TransactionNumber,
            JournalType = firstRow.JournalType,
            EntryDate = firstRow.EntryDate,
            CreatedAt = firstRow.CreatedAt,
            UpdatedAt = firstRow.UpdatedAt,
            IsLocked = isLocked,
            Lines = rows.Select(l => new GeneralJournalLineDto
            {
                Id = l.LineId,
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = l.LineOrder
            }).ToList()
        };
    }

    public async Task<List<GeneralJournalResponseDto>> GetByTransactionNumberAsync(Guid userId, string transactionNumber)
    {
        var rows = await _db.GeneralJournals
            .Where(gj => gj.TransactionNumber == transactionNumber && gj.UserId == userId)
            .OrderBy(gj => gj.LineOrder)
            .ToListAsync();

        if (!rows.Any()) return new List<GeneralJournalResponseDto>();

        var closedPeriods = await _db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        return rows
            .GroupBy(row => row.JournalEntryId)
            .Select(group =>
            {
                var firstRow = group.First();
                return new GeneralJournalResponseDto
                {
                    Id = firstRow.JournalEntryId,
                    TransactionNumber = firstRow.TransactionNumber,
                    JournalType = firstRow.JournalType,
                    EntryDate = firstRow.EntryDate,
                    CreatedAt = firstRow.CreatedAt,
                    UpdatedAt = firstRow.UpdatedAt,
                    IsLocked = PeriodLock.IsDateLocked(firstRow.EntryDate, closedPeriods),
                    Lines = group.Select(l => new GeneralJournalLineDto
                    {
                        Id = l.LineId,
                        AccountId = l.AccountId,
                        LineDescription = l.LineDescription,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        LineOrder = l.LineOrder
                    }).ToList()
                };
            })
            .ToList();
    }

    public async Task<GeneralJournalResponseDto> CreateAsync(Guid userId, CreateGeneralJournalRequest request)
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

        return new GeneralJournalResponseDto
        {
            Id = entry.Id,
            TransactionNumber = entry.TransactionNumber,
            JournalType = entry.JournalType,
            EntryDate = entry.EntryDate,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt,
            IsLocked = false,
            Lines = entry.Lines.Select(l => new GeneralJournalLineDto
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

    public async Task UpdateAsync(Guid userId, int id, UpdateGeneralJournalRequest request)
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

    public async Task DeleteByTransactionNumberAsync(Guid userId, string transactionNumber)
    {
        var entry = await _db.JournalEntries
            .FirstOrDefaultAsync(j => j.TransactionNumber == transactionNumber && j.UserId == userId);

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

    public async Task<List<string>> SearchLineDescriptionsAsync(Guid userId, string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return new List<string>();
        }

        var keyword = query.Trim();

        // Membaca langsung dari GeneralJournals tanpa butuh .Include()
        return await _db.GeneralJournals
            .Where(gj => gj.UserId == userId
                      && gj.LineDescription != null && gj.LineDescription != ""
                      && EF.Functions.ILike(gj.LineDescription, $"%{keyword}%"))
            .GroupBy(gj => gj.LineDescription)
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Max(gj => gj.LineId))
            .Select(g => g.Key!)
            .Take(8)
            .ToListAsync();
    }

    public async Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate)
    {
        string type = string.IsNullOrWhiteSpace(journalType) ? "General" : journalType;
        return await _transactionNumberService.PeekNextAsync(userId, type, entryDate ?? DateTime.Today);
    }

    private static List<CreateGeneralJournalLineRequest> ValidateAndExtractLines(List<CreateGeneralJournalLineRequest> lines)
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

    private async Task ValidateAccountsAsync(Guid userId, List<CreateGeneralJournalLineRequest> lines)
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