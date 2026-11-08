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
    public async Task Update_InOpenPeriod_ReplacesLinesAndKeepsTransactionNumber()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        await svc.UpdateAsync(u.UserId, created.Id, new UpdateGeneralJournalRequest
        {
            JournalType = "General",
            EntryDate = SeededUser.Utc(2026, 1, 8),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 500m },
                new() { AccountId = u.EquityId, Credit = 500m },
            },
        });

        await using var verify = fixture.CreateDb();
        var rows = await verify.GeneralJournals.Where(g => g.UserId == u.UserId).ToListAsync();
        Assert.Equal(2, rows.Count);
        Assert.All(rows, r =>
        {
            Assert.Equal("GJ26010001", r.TransactionNumber);
            Assert.Equal(created.Id, r.JournalEntryId);
            Assert.NotNull(r.UpdatedAt);
        });
        Assert.Equal(500m, rows.Sum(r => r.Debit));
    }

    [Fact]
    public async Task Update_MovingDateIntoClosedPeriod_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.UpdateAsync(u.UserId, created.Id, new UpdateGeneralJournalRequest
        {
            JournalType = "General",
            EntryDate = SeededUser.Utc(2025, 12, 20),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 100m },
                new() { AccountId = u.EquityId, Credit = 100m },
            },
        }));
    }

    [Fact]
    public async Task Update_AfterPeriodIsClosed_Throws()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));
        (await db.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed = true;
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.UpdateAsync(u.UserId, created.Id, new UpdateGeneralJournalRequest
        {
            JournalType = "General",
            EntryDate = SeededUser.Utc(2026, 1, 5),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 100m },
                new() { AccountId = u.EquityId, Credit = 100m },
            },
        }));
    }

    [Fact]
    public async Task Update_UnknownId_ThrowsKeyNotFound()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => Service(db).UpdateAsync(u.UserId, 987654, new UpdateGeneralJournalRequest
        {
            EntryDate = SeededUser.Utc(2026, 1, 5),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 1m },
                new() { AccountId = u.EquityId, Credit = 1m },
            },
        }));
    }

    [Fact]
    public async Task Delete_InOpenPeriod_RemovesAllRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        await svc.DeleteAsync(u.UserId, created.Id);

        await using var verify = fixture.CreateDb();
        Assert.False(await verify.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task DeleteByTransactionNumber_InOpenPeriod_RemovesAllRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));

        await svc.DeleteByTransactionNumberAsync(u.UserId, created.TransactionNumber);

        await using var verify = fixture.CreateDb();
        Assert.False(await verify.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task Delete_AfterPeriodIsClosed_ThrowsAndKeepsRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var svc = Service(db);
        var created = await svc.CreateAsync(u.UserId, Request(u, SeededUser.Utc(2026, 1, 5), 100m));
        (await db.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed = true;
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.DeleteAsync(u.UserId, created.Id));

        await using var verify = fixture.CreateDb();
        Assert.Equal(2, await verify.GeneralJournals.CountAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task Delete_UnknownId_ThrowsKeyNotFound()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => Service(db).DeleteAsync(u.UserId, 987654));
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
