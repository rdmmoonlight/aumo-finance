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
        var sourceGroups = sourceRows.GroupBy(g => g.JournalEntryId).ToList();

        // Seluruh jurnal pembalik tersimpan atau tidak sama sekali: satu transaksi di sekitar semua PostAsync.
        var strategy = _db.Database.CreateExecutionStrategy();
        var created = await strategy.ExecuteAsync(async () =>
        {
            _db.ChangeTracker.Clear();
            await using var tx = await _db.Database.BeginTransactionAsync();

            var posted = new List<PostedJournal>();
            foreach (var group in sourceGroups)
            {
                var sourceHeader = group.First();

                // Debit dan Kredit setiap baris ditukar. Penulisan ke GeneralJournals hanya lewat IJournalPostingService.
                posted.Add(await _posting.PostAsync(new PostJournalCommand(
                    userId,
                    ReversingType,
                    reversalDate,
                    group.OrderBy(l => l.LineOrder).Select(l => new JournalLine(
                        l.AccountId,
                        string.IsNullOrWhiteSpace(l.LineDescription)
                            ? $"Reversing {sourceHeader.TransactionNumber}"
                            : $"Reversing: {l.LineDescription}",
                        l.Credit,
                        l.Debit)).ToList(),
                    createdAt,
                    sourceHeader.JournalEntryId)));
            }

            await tx.CommitAsync();
            return posted;
        });

        return created.Select(c => new GeneralJournalResponseDto
        {
            Id = c.JournalEntryId,
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
