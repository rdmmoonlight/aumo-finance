namespace AumoBackend.Services.JournalEntry;

using AumoBackend.Data;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

/// <inheritdoc cref="IJournalPostingService"/>
public sealed class JournalPostingService(AppDbContext db, ITransactionNumberService transactionNumbers) : IJournalPostingService
{
    private const string DefaultJournalType = "General";

    public async Task<PostedJournal> PostAsync(PostJournalCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        // Validasi aturan domain lebih dulu, sebelum nomor transaksi terpakai.
        var entry = AumoBackend.Domain.JournalEntry.Create(command.Lines);

        string journalType = string.IsNullOrWhiteSpace(command.JournalType) ? DefaultJournalType : command.JournalType;
        var entryDate = DateTime.SpecifyKind(command.EntryDate, DateTimeKind.Utc);
        var createdAt = DateTime.SpecifyKind(
            command.CreatedAt is { } given && given != default ? given : DateTime.UtcNow,
            DateTimeKind.Utc);

        string transactionNumber = await transactionNumbers.GenerateAsync(command.UserId, journalType, command.EntryDate);
        int journalEntryId = await this.AllocateJournalEntryIdAsync(ct);

        var rows = GeneralJournalWriter.BuildRows(
            journalEntryId, command.UserId, transactionNumber, journalType, entryDate, createdAt, null, ToWriterLines(entry));

        foreach (var row in rows)
        {
            row.SourceJournalEntryId = command.SourceJournalEntryId;
        }

        db.GeneralJournals.AddRange(rows);
        await db.SaveChangesAsync(ct);

        return new PostedJournal(journalEntryId, transactionNumber, journalType, entryDate, createdAt, null, rows);
    }

    public async Task<PostedJournal> ReplaceAsync(ReplaceJournalCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var existing = await this.LoadEntryAsync(command.UserId, command.JournalEntryId, ct);
        var header = existing[0];

        var entry = AumoBackend.Domain.JournalEntry.Create(command.Lines);

        var entryDate = DateTime.SpecifyKind(command.EntryDate, DateTimeKind.Utc);
        var updatedAt = DateTime.UtcNow;

        var rows = GeneralJournalWriter.BuildRows(
            header.JournalEntryId, header.UserId, header.TransactionNumber, header.JournalType,
            entryDate, header.CreatedAt, updatedAt, ToWriterLines(entry));

        foreach (var row in rows)
        {
            row.SourceJournalEntryId = header.SourceJournalEntryId;
        }

        // Hapus dan tulis ulang dalam satu SaveChanges: tersimpan seluruhnya atau tidak sama sekali.
        // Baris buku besar yang menunjuk baris lama ikut terhapus oleh FK cascade.
        db.GeneralJournals.RemoveRange(existing);
        db.GeneralJournals.AddRange(rows);
        await db.SaveChangesAsync(ct);

        return new PostedJournal(
            header.JournalEntryId, header.TransactionNumber, header.JournalType,
            entryDate, header.CreatedAt, updatedAt, rows);
    }

    public async Task<int> RemoveAsync(Guid userId, int journalEntryId, CancellationToken ct = default)
    {
        var existing = await this.LoadEntryAsync(userId, journalEntryId, ct);

        db.GeneralJournals.RemoveRange(existing);
        await db.SaveChangesAsync(ct);

        return existing.Count;
    }

    private static IEnumerable<GeneralJournalWriter.Line> ToWriterLines(AumoBackend.Domain.JournalEntry entry)
        => entry.Lines.Select(l => new GeneralJournalWriter.Line(l.AccountId, l.Description, l.Debit, l.Credit));

    private async Task<List<GeneralJournal>> LoadEntryAsync(Guid userId, int journalEntryId, CancellationToken ct)
    {
        var rows = await db.GeneralJournals
            .Where(g => g.UserId == userId && g.JournalEntryId == journalEntryId)
            .OrderBy(g => g.LineOrder)
            .ToListAsync(ct);

        if (rows.Count == 0)
        {
            throw new KeyNotFoundException($"Journal entry {journalEntryId} was not found.");
        }

        return rows;
    }

    /// <summary>
    /// Satu sumber nomor: sequence <c>GeneralJournal_JournalEntryId_seq</c>. Nomor yang sudah dipakai baris lama
    /// (dari masa ketika sebagian jalur memakai MAX+1) dilewati, sehingga sequence menyusul sendiri tanpa tabrakan.
    /// </summary>
    private async Task<int> AllocateJournalEntryIdAsync(CancellationToken ct)
    {
        while (true)
        {
            int id = await GeneralJournalWriter.NextJournalEntryIdAsync(db, ct);
            if (!await db.GeneralJournals.AnyAsync(g => g.JournalEntryId == id, ct))
            {
                return id;
            }
        }
    }
}
