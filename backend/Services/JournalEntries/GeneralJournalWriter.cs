using AumoBackend.Data;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services.JournalEntries;

/// <summary>
/// Satu-satunya jalur penulisan jurnal ke tabel GeneralJournal.
/// 1 baris GeneralJournal = 1 baris jurnal (data header ikut di setiap baris).
/// </summary>
public static class GeneralJournalWriter
{
    public const string PostedStatus = "Posted";

    /// <summary>Data satu baris jurnal (tanpa header).</summary>
    public sealed record Line(int AccountId, string? LineDescription, decimal Debit, decimal Credit);

    /// <summary>
    /// Mengambil id kelompok jurnal (JournalEntryId) berikutnya dari sequence
    /// "GeneralJournal_JournalEntryId_seq". Tidak ada tabel header lagi,
    /// sehingga id ini dibangkitkan di sini.
    /// </summary>
    public static Task<int> NextJournalEntryIdAsync(AppDbContext db, CancellationToken ct = default)
        => db.Database
            .SqlQuery<int>($"SELECT nextval('\"GeneralJournal_JournalEntryId_seq\"')::int AS \"Value\"")
            .SingleAsync(ct);

    /// <summary>
    /// Membentuk baris GeneralJournal untuk satu jurnal. LineOrder diisi
    /// berurutan sesuai urutan baris yang diberikan. Baris belum ditambahkan
    /// ke DbContext; pemanggil yang memanggil AddRange lalu SaveChanges.
    /// </summary>
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
            LineOrder = order++
        }).ToList();
    }
}
