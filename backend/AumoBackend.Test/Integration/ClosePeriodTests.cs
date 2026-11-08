namespace AumoBackend.Test.Integration;

using AumoBackend.Models;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Periods;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.EntityFrameworkCore;

[Collection(PostgresCollection.Name)]
public class ClosePeriodTests(PostgresFixture fixture)
{
    private static PeriodsService Service(AumoBackend.Data.AppDbContext db) =>
        new(db, new TransactionNumberService(db), new GeneralLedgersService(db));

    [Fact]
    public async Task Close_OpenPeriodWithNoEarlierOpenPeriod_Succeeds()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.True(result.Success);
        await using var verify = fixture.CreateDb();
        Assert.True((await verify.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_AlreadyClosedPeriod_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.ClosedPeriodId);

        Assert.False(result.Success);
        Assert.Contains("already closed", result.Message);
    }

    [Fact]
    public async Task Close_UnknownPeriod_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, 987654);

        Assert.False(result.Success);
        Assert.Contains("not found", result.Message);
    }

    [Fact]
    public async Task Close_PeriodOfAnotherUser_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(other.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.False((await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_WhileEarlierPeriodIsStillOpen_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        // Buka kembali Desember 2025 sehingga Januari 2026 tidak boleh ditutup lebih dulu.
        (await db.Periods.SingleAsync(p => p.Id == u.ClosedPeriodId)).IsClosed = false;
        await db.SaveChangesAsync();

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.Contains("earlier period", result.Message);
        Assert.False((await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_ThenCreatingJournalInThatPeriod_IsRejected()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        var entryService = new JournalEntryService(db, new TransactionNumberService(db));
        await Assert.ThrowsAsync<InvalidOperationException>(() => entryService.CreateAsync(u.UserId, new AumoBackend.DTOs.Reports.CreateGeneralJournalRequest
        {
            EntryDate = SeededUser.Utc(2026, 1, 10),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 10m },
                new() { AccountId = u.EquityId, Credit = 10m },
            },
        }));
    }
}
