namespace AumoBackend.Services.JournalEntry;

using AumoBackend.Data;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

public static class GeneralJournalWriter
{
    public const string PostedStatus = "Posted";

    public sealed record Line(int AccountId, string? LineDescription, decimal Debit, decimal Credit);

    public static async Task<int> NextJournalEntryIdAsync(AppDbContext db, CancellationToken ct = default)
    {
        var result = await db.Database
     .SqlQueryRaw<int>("SELECT nextval('\"GeneralJournal_JournalEntryId_seq\"')::int AS \"Value\"")
     .SingleAsync(ct);

        return result;
    }

    public static List<GeneralJournal> BuildRows(
        int journalEntryId,
        Guid userId,
        string transactionNumber,
        string journalType,
        DateTime entryDate,
        DateTime createdAt,
        DateTime? updatedAt,
        IEnumerable<Line> lines,
        string status = PostedStatus)
    {
        int order = 0;
        return lines.Select(l => new GeneralJournal
        {
            JournalEntryId = journalEntryId,
            UserId = userId,
            TransactionNumber = transactionNumber,
            JournalType = journalType,
            EntryDate = entryDate,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            Status = status,
            AccountId = l.AccountId,
            LineDescription = l.LineDescription,
            Debit = l.Debit,
            Credit = l.Credit,
            LineOrder = order++,
        }).ToList();
    }
}
