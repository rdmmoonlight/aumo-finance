namespace AumoBackend.Test.Integration;

using AumoBackend.DTOs;
using AumoBackend.DTOs.Reports;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.Journals;
using AumoBackend.Services.Tools;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Temuan no. 4 (kunci periode tidak seragam): satu tes per jalur masuk/keluar jurnal.
/// Tes bertanda "CurrentBehavior" mendokumentasikan celah yang ADA SAAT INI; bila celah ditutup (Fase 2.3/2.5),
/// ubah assert-nya menjadi penolakan.
/// </summary>
[Collection(PostgresCollection.Name)]
public class PeriodLockPathsTests(PostgresFixture fixture)
{
    [Fact]
    public async Task DeleteAdjusting_InClosedPeriod_IsRejected()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var entryService = new JournalEntryService(db, new TransactionNumberService(db));

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

        var journals = new JournalsService(db, null!, entryService);

        await Assert.ThrowsAsync<InvalidOperationException>(() => journals.DeleteAdjustingAsync(u.UserId, entryId));
        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.JournalEntryId == entryId));
    }

    [Fact]
    public async Task DeleteAdjusting_InOpenPeriod_Succeeds()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var entryService = new JournalEntryService(db, new TransactionNumberService(db));
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

        var journals = new JournalsService(db, null!, entryService);
        await journals.DeleteAdjustingAsync(u.UserId, created.Id);

        Assert.False(await db.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task Import_IntoClosedPeriod_IsNotRejected_CurrentBehavior()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var tools = new ToolsService(db);

        var result = await tools.ImportJournalEntriesAsync(u.UserId, new JournalImportRequestDto
        {
            TargetYear = 2025,
            TargetMonth = 12,
            Transactions = new()
            {
                new JournalTransactionDto
                {
                    Date = "2025-12-15",
                    JournalType = "General",
                    Lines = new()
                    {
                        new JournalLineDto { RefNumber = 101, AccountName = "Kas", Debit = 100m },
                        new JournalLineDto { RefNumber = 301, AccountName = "Modal", Credit = 100m },
                    },
                },
            },
        });

        // Celah: periode Desember 2025 sudah tertutup, tetapi import tetap menulis jurnal ke dalamnya.
        Assert.Equal(1, result.ImportedEntriesCount);
        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.UserId == u.UserId));
        Assert.True((await db.Periods.SingleAsync(p => p.Id == u.ClosedPeriodId)).IsClosed);
    }
}
