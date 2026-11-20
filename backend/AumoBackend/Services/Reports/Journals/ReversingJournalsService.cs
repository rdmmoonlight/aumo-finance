namespace AumoBackend.Services.Reports.Journals;

using AumoBackend.Domain;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntry;
using Microsoft.EntityFrameworkCore;

public partial class JournalsService
{
    private const string AdjustingType = "Adjusting";
    private const string ReversingType = "Reversing";

    public async Task<List<GeneralJournalResponseDto>> CreateReversingAsync(Guid userId, CreateReversingRequest request)
    {
        var sourceIds = (request?.AdjustingEntryIds ?? new List<int>()).Distinct().ToList();
        if (sourceIds.Count == 0)
        {
            throw new DomainRuleViolation("Pilih minimal satu jurnal penyesuaian yang akan dibalik.");
        }

        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId)
            ?? throw new DomainRuleViolation("Belum ada periode akuntansi yang dipilih.");

        if (period.IsClosed)
        {
            throw new DomainRuleViolation("Periode terpilih sudah ditutup. Jurnal pembalik hanya dapat dibuat pada periode yang masih terbuka.");
        }

        // Jurnal pembalik dicatat pada hari pertama periode terpilih.
        var reversalDate = DateTime.SpecifyKind(period.StartDate.Date, DateTimeKind.Utc);

        var sourceRows = await _db.GeneralJournals
            .AsNoTracking()
            .Where(g => g.UserId == userId
                     && g.JournalType == AdjustingType
                     && sourceIds.Contains(g.JournalEntryId))
            .OrderBy(g => g.JournalEntryId)
            .ThenBy(g => g.LineOrder)
            .ToListAsync();

        var missingIds = sourceIds.Except(sourceRows.Select(g => g.JournalEntryId).Distinct()).ToList();
        if (missingIds.Count > 0)
        {
            throw new KeyNotFoundException($"Jurnal penyesuaian tidak ditemukan: {string.Join(", ", missingIds)}.");
        }

        // Hanya jurnal penyesuaian dari periode sebelumnya yang dapat dibalik.
        if (sourceRows.Any(g => g.EntryDate.Date >= reversalDate.Date))
        {
            throw new DomainRuleViolation("Jurnal yang dibalik harus bertanggal sebelum awal periode terpilih.");
        }

        // Satu jurnal sumber hanya boleh dibalik satu kali.
        var alreadyReversed = await _db.GeneralJournals
            .AsNoTracking()
            .Where(g => g.UserId == userId
                     && g.JournalType == ReversingType
                     && g.SourceJournalEntryId != null
                     && sourceIds.Contains(g.SourceJournalEntryId.Value))
            .Select(g => g.SourceJournalEntryId!.Value)
            .Distinct()
            .ToListAsync();

        if (alreadyReversed.Count > 0)
        {
            throw new DomainRuleViolation($"Jurnal berikut sudah pernah dibalik: {string.Join(", ", alreadyReversed)}.");
        }

        var createdAt = DateTime.UtcNow;
        var created = new List<(int EntryId, string TransactionNumber, List<GeneralJournal> Rows)>();
        var nextJournalEntryId = (await _db.GeneralJournals
            .Select(g => (int?)g.JournalEntryId)
            .MaxAsync() ?? 0) + 1;

        foreach (var group in sourceRows.GroupBy(g => g.JournalEntryId))
        {
            var sourceHeader = group.First();
            int journalEntryId = nextJournalEntryId++;
            string transactionNumber = await _transactionNumberService.GenerateAsync(userId, ReversingType, reversalDate);

            // Debit dan Kredit setiap baris ditukar.
            var rows = GeneralJournalWriter.BuildRows(
                journalEntryId,
                userId,
                transactionNumber,
                ReversingType,
                reversalDate,
                createdAt,
                null,
                group.OrderBy(l => l.LineOrder).Select(l => new GeneralJournalWriter.Line(
                    l.AccountId,
                    string.IsNullOrWhiteSpace(l.LineDescription)
                        ? $"Reversing {sourceHeader.TransactionNumber}"
                        : $"Reversing: {l.LineDescription}",
                    l.Credit,
                    l.Debit)));

            foreach (var row in rows)
            {
                row.SourceJournalEntryId = sourceHeader.JournalEntryId;
            }

            created.Add((journalEntryId, transactionNumber, rows.Select(row => new AumoBackend.Models.GeneralJournal
            {
                LineId = row.LineId,
                JournalEntryId = row.JournalEntryId,
                UserId = row.UserId,
                TransactionNumber = row.TransactionNumber,
                JournalType = row.JournalType,
                EntryDate = row.EntryDate,
                CreatedAt = row.CreatedAt,
                SourceJournalEntryId = row.SourceJournalEntryId,
                AccountId = row.AccountId,
                LineDescription = row.LineDescription,
                Debit = row.Debit,
                Credit = row.Credit,
                LineOrder = row.LineOrder,
            }).ToList()));
        }

        // Satu SaveChanges: seluruh jurnal pembalik tersimpan atau tidak sama sekali.
        _db.GeneralJournals.AddRange(created.SelectMany(c => c.Rows));
        await _db.SaveChangesAsync();

        return created.Select(c => new GeneralJournalResponseDto
        {
            Id = c.EntryId,
            TransactionNumber = c.TransactionNumber,
            JournalType = ReversingType,
            EntryDate = reversalDate,
            UserId = userId,
            Status = GeneralJournalWriter.PostedStatus,
            IsLocked = false,
            CreatedAt = createdAt,
            Lines = c.Rows.Select(l => new GeneralJournalLineDto
            {
                Id = l.LineId,
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = l.LineOrder,
            }).ToList(),
        }).ToList();
    }
}
