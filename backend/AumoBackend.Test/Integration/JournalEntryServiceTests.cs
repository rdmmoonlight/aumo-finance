namespace AumoBackend.Test.Integration;

using AumoBackend.DTOs.Reports;
using AumoBackend.Services.JournalEntries;
using Microsoft.EntityFrameworkCore;

[Collection(PostgresCollection.Name)]
public class JournalEntryServiceTests(PostgresFixture fixture)
{
    private static CreateGeneralJournalRequest Request(SeededUser u, DateTime date, decimal amount) => new()
    {
        JournalType = "General",
        EntryDate = date,
        Lines = new()
        {
            new() { AccountId = u.CashId, LineDescription = "Setoran modal", Debit = amount },
            new() { AccountId = u.EquityId, LineDescription = "Setoran modal", Credit = amount },
        },
    };

    private static JournalEntryService Service(AumoBackend.Data.AppDbContext db) =>
        new(db, new TransactionNumberService(db));

    [Fact]
    public async Task Create_InOpenPeriod_PersistsPostedRowsWithTransactionNumber()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 1000m));

        Assert.Equal("GJ26010001", result.TransactionNumber);
        Assert.Equal(2, result.Lines.Count);

        await using var verify = fixture.CreateDb();
        var rows = await verify.GeneralJournals.Where(g => g.UserId == u.UserId).OrderBy(g => g.LineOrder).ToListAsync();
        Assert.Equal(2, rows.Count);
        Assert.All(rows, r => Assert.Equal("Posted", r.Status));
        Assert.Equal(new[] { 0, 1 }, rows.Select(r => r.LineOrder).ToArray());
        Assert.Equal(1000m, rows.Sum(r => r.Debit));
        Assert.Equal(1000m, rows.Sum(r => r.Credit));
    }

    [Fact]
    public async Task Create_TwiceInSameMonth_IncrementsTransactionNumber()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);

        var first = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));
        var second = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 6), 200m));

        Assert.Equal("GJ26010001", first.TransactionNumber);
        Assert.Equal("GJ26010002", second.TransactionNumber);
        Assert.NotEqual(first.Id, second.Id);
    }

    [Fact]
    public async Task Create_DateInClosedPeriod_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            Service(db).CreateAsync(u.UserId, Request(u, SeededUser.Utc(2025, 12, 15), 100m)));

        Assert.False(await db.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task Create_WithAccountOfAnotherUser_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);

        var request = Request(u, SeededUser.Utc(2026, 1, 5), 100m);
        request.Lines[0].AccountId = other.CashId;

        await Assert.ThrowsAsync<ArgumentException>(() => Service(db).CreateAsync(u.UserId, request));
    }

    [Fact]
    public async Task Create_WithInactiveAccount_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var cash = await db.ChartOfAccounts.SingleAsync(a => a.Id == u.CashId);
        cash.IsActive = false;
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            Service(db).CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m)));
    }

    [Fact]
    public async Task Create_Unbalanced_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var request = Request(u, SeededUser.Utc(2026, 1, 5), 100m);
        request.Lines[1].Credit = 90m;

        await Assert.ThrowsAsync<ArgumentException>(() => Service(db).CreateAsync(u.UserId, request));
    }

    [Fact]
    public async Task GetById_ReportsLockedWhenDateInClosedPeriod()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        Assert.False((await svc.GetByIdAsync(u.UserId, created.Id))!.IsLocked);

        (await db.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed = true;
        await db.SaveChangesAsync();

        Assert.True((await svc.GetByIdAsync(u.UserId, created.Id))!.IsLocked);
    }

    [Fact]
    public async Task GetById_OfAnotherUser_ReturnsNull()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);
        var created = await Service(db).CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        Assert.Null(await Service(db).GetByIdAsync(other.UserId, created.Id));
    }
}
