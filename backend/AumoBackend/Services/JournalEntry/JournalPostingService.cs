namespace AumoBackend.Services.JournalEntry;

using AumoBackend.Data;
using AumoBackend.Domain;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

/// <inheritdoc cref="IJournalPostingService"/>
public sealed class JournalPostingService(AppDbContext db, ITransactionNumberService transactionNumbers) : IJournalPostingService
{
    private const string DefaultJournalType = "General";

    // Pesan sama dengan yang sebelumnya dilempar JournalEntryService, agar respons API tidak berubah.
    private const string InvalidAccountsMessage = "One or more selected accounts are invalid or inactive.";
    private const string ClosedDateMessage = "This date falls within a closed accounting period. Choose a date in an open period.";
    private const string LockedEntryMessage = "This journal falls within a closed accounting period and cannot be changed.";

    public async Task<PostedJournal> PostAsync(PostJournalCommand command, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        // Seluruh pemeriksaan dilakukan lebih dulu, sebelum nomor transaksi terpakai:
        // 1. aturan domain (baris, saldo seimbang), 2. akun aktif milik pengguna, 3. kunci periode menurut tanggal.
        var entry = AumoBackend.Domain.JournalEntry.Create(command.Lines);
        await this.EnsureAccountsUsableAsync(command.UserId, entry, ct);
        await this.EnsureDateOpenAsync(command.UserId, command.EntryDate, ClosedDateMessage, ct);

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

        // Jurnal yang kini berada di periode tertutup tidak dapat diubah; tanggal baru juga tidak boleh jatuh di sana.
        var closedPeriods = await this.LoadClosedPeriodsAsync(command.UserId, ct);
        EnsureDateOpen(closedPeriods, header.EntryDate, LockedEntryMessage);

        var entry = AumoBackend.Domain.JournalEntry.Create(command.Lines);
        await this.EnsureAccountsUsableAsync(command.UserId, entry, ct);
        EnsureDateOpen(closedPeriods, command.EntryDate, ClosedDateMessage);

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

        await this.EnsureDateOpenAsync(userId, existing[0].EntryDate, LockedEntryMessage, ct);

        db.GeneralJournals.RemoveRange(existing);
        await db.SaveChangesAsync(ct);

        return existing.Count;
    }

    /// <summary>Setiap akun pada baris harus aktif dan milik pengguna yang sama.</summary>
    private async Task EnsureAccountsUsableAsync(Guid userId, AumoBackend.Domain.JournalEntry entry, CancellationToken ct)
    {
        var accountIds = entry.Lines.Select(l => l.AccountId).Distinct().ToList();

        int usable = await db.ChartOfAccounts
            .Where(a => a.UserId == userId && a.IsActive && accountIds.Contains(a.Id))
            .CountAsync(ct);

        if (usable != accountIds.Count)
        {
            throw new DomainRuleViolation(InvalidAccountsMessage);
        }
    }

    /// <summary>Kunci periode ditentukan oleh tanggal entri (<see cref="PeriodLock"/>), bukan oleh periode yang sedang dipilih.</summary>
    private async Task EnsureDateOpenAsync(Guid userId, DateTime date, string message, CancellationToken ct)
        => EnsureDateOpen(await this.LoadClosedPeriodsAsync(userId, ct), date, message);

    private static void EnsureDateOpen(IReadOnlyList<Period> closedPeriods, DateTime date, string message)
    {
        if (PeriodLock.IsDateLocked(date, closedPeriods))
        {
            throw new DomainRuleViolation(message);
        }
    }

    private async Task<List<Period>> LoadClosedPeriodsAsync(Guid userId, CancellationToken ct)
        => await db.Periods
            .AsNoTracking()
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync(ct);

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
