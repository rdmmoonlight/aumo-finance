using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public interface IJournalService
{
    Task<List<JournalEntry>> GetByPeriodAsync(Guid userId, DateTime start, DateTime end);
    Task<string> PeekNextNumberAsync(Guid userId, string journalType, DateTime entryDate);
    Task<JournalEntry> CreateAsync(Guid userId, DateTime entryDate, string journalType, string description, List<JournalEntryLine> lines);
}

public class JournalService : IJournalService
{
    private readonly AppDbContext _db;
    private readonly ITransactionNumberService _numberService;

    public JournalService(AppDbContext db, ITransactionNumberService numberService)
    {
        _db = db;
        _numberService = numberService;
    }

    public Task<List<JournalEntry>> GetByPeriodAsync(Guid userId, DateTime start, DateTime end)
    {
        return _db.JournalEntries
            .Include(j => j.Lines).ThenInclude(l => l.Account)
            .Where(j => j.UserId == userId && j.EntryDate >= start && j.EntryDate <= end)
            .OrderBy(j => j.EntryDate)
            .ToListAsync();
    }

    public Task<string> PeekNextNumberAsync(Guid userId, string journalType, DateTime entryDate)
        => _numberService.PeekNextAsync(userId, journalType, entryDate);

    public async Task<JournalEntry> CreateAsync(Guid userId, DateTime entryDate, string journalType, string description, List<JournalEntryLine> lines)
    {
        if (lines.Sum(l => l.Debit) != lines.Sum(l => l.Credit))
            throw new InvalidOperationException("Journal tidak balance: Total Debit harus = Total Credit.");

        var trxNumber = await _numberService.GenerateAsync(userId, journalType, entryDate);

        var entry = new JournalEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TransactionNumber = trxNumber,
            EntryDate = DateTime.SpecifyKind(entryDate, DateTimeKind.Utc),
            JournalType = journalType, // General / Adjusting
            Description = description,
            Lines = lines
        };

        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync();
        return entry;
    }
}