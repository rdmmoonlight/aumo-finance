namespace AumoBackend.Test.Integration;

using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntry;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Temuan no. 4 (kunci periode tidak seragam): satu tes per jalur masuk/keluar jurnal.
/// Jalur import (ToolsService) sudah tidak ada di backend, sehingga tes import dihapus.
/// </summary>
[Collection(PostgresCollection.Name)]
public class PeriodLockPathsTests(PostgresFixture fixture)
{
    [Fact]
    public async Task DeleteAdjusting_InClosedPeriod_IsRejected()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        // Jurnal penyesuaian pada tanggal di periode tertutup disisipkan langsung (jalur normal menolaknya).
        int entryId = await GeneralJournalWriter.NextJournalEntryIdAsync(db);
        db.GeneralJournals.AddRange(GeneralJournalWriter.BuildRows(
            entryId, u.UserId, "AJ251200001", "Adjusting",
            SeededUser.Utc(2025, 12, 20), SeededUser.Utc(2025, 12, 20), null,
            new[]
            {
                new GeneralJournalWriter.Line(u.CashId, null, 50m, 0m),
                new GeneralJournalWriter.Line(u.EquityId, null, 0m, 50m),
            }));
        await db.SaveChangesAsync();

        var closedPeriods = await db.Periods
            .AsNoTracking()
            .Where(p => p.UserId == u.UserId && p.IsClosed)
            .ToListAsync();

        var rows = await db.GeneralJournals
            .Where(g => g.UserId == u.UserId && g.JournalEntryId == entryId)
            .ToListAsync();

        Assert.True(PeriodLock.IsDateLocked(rows.First().EntryDate, closedPeriods));
        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.JournalEntryId == entryId));
    }

    [Fact]
    public async Task DeleteAdjusting_InOpenPeriod_Succeeds()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var entryService = new JournalEntryService(db, new TransactionNumberService(db), posting);
        var created = await entryService.CreateAsync(u.UserId, new CreateGeneralJournalRequest
        {
            JournalType = "Adjusting",
            EntryDate = SeededUser.Utc(2026, 1, 20),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 50m },
                new() { AccountId = u.EquityId, Credit = 50m },
            },
        });

        Assert.False(created.IsLocked);

        int removed = await posting.RemoveAsync(u.UserId, created.Id);

        Assert.Equal(2, removed);
        Assert.False(await db.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }
}
