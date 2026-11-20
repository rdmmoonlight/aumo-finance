namespace AumoBackend.Test.Integration;

using AumoBackend.Domain;
using AumoBackend.Services.JournalEntry;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.EntityFrameworkCore;

[Collection(PostgresCollection.Name)]
public class JournalPostingServiceTests(PostgresFixture fixture)
{
    private static JournalLine[] Lines(SeededUser u, decimal amount) => new[]
    {
        new JournalLine(u.CashId, "Kas", amount, 0m),
        new JournalLine(u.EquityId, "Modal", 0m, amount),
    };

    private static PostJournalCommand Command(SeededUser u, decimal amount = 100m, string? type = "General", int? source = null) =>
        new(u.UserId, type, SeededUser.Utc(2026, 1, 5), Lines(u, amount), null, source);

    [Fact]
    public async Task Post_PersistsPostedRowsWithTransactionNumberAndId()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var posted = await TestPosting.For(db).PostAsync(Command(u, 250m));

        Assert.Equal("GJ26010001", posted.TransactionNumber);
        Assert.Equal("General", posted.JournalType);
        Assert.Equal(2, posted.Rows.Count);
        Assert.All(posted.Rows, r => Assert.True(r.LineId > 0));

        await using var verify = fixture.CreateDb();
        var rows = await verify.GeneralJournals
            .Where(g => g.UserId == u.UserId && g.JournalEntryId == posted.JournalEntryId)
            .OrderBy(g => g.LineOrder)
            .ToListAsync();
        Assert.Equal(2, rows.Count);
        Assert.All(rows, r => Assert.Equal("Posted", r.Status));
        Assert.Equal(new[] { 0, 1 }, rows.Select(r => r.LineOrder).ToArray());
        Assert.Equal(250m, rows.Sum(r => r.Debit));
        Assert.Equal(250m, rows.Sum(r => r.Credit));
    }

    [Fact]
    public async Task Post_BlankJournalType_DefaultsToGeneral()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var posted = await TestPosting.For(db).PostAsync(Command(u, type: " "));

        Assert.Equal("General", posted.JournalType);
    }

    [Fact]
    public async Task Post_Unbalanced_ThrowsAndWritesNothing()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var lines = new[]
        {
            new JournalLine(u.CashId, null, 100m, 0m),
            new JournalLine(u.EquityId, null, 0m, 90m),
        };

        await Assert.ThrowsAsync<DomainRuleViolation>(() =>
            TestPosting.For(db).PostAsync(new PostJournalCommand(u.UserId, "General", SeededUser.Utc(2026, 1, 5), lines)));

        Assert.False(await db.GeneralJournals.AnyAsync(g => g.UserId == u.UserId));
    }

    [Fact]
    public async Task Post_Twice_GivesDistinctJournalEntryIds()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);

        var first = await posting.PostAsync(Command(u));
        var second = await posting.PostAsync(Command(u));

        Assert.NotEqual(first.JournalEntryId, second.JournalEntryId);
        Assert.Equal("GJ26010001", first.TransactionNumber);
        Assert.Equal("GJ26010002", second.TransactionNumber);
    }

    [Fact]
    public async Task Post_SkipsJournalEntryIdsAlreadyUsedByExistingRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        // Meniru baris lama yang ditulis lewat MAX+1: memakai nomor yang akan keluar berikutnya dari sequence.
        int taken = await GeneralJournalWriter.NextJournalEntryIdAsync(db) + 1;
        db.GeneralJournals.AddRange(GeneralJournalWriter.BuildRows(
            taken, u.UserId, "GJ25120001", "General",
            SeededUser.Utc(2025, 12, 5), SeededUser.Utc(2025, 12, 5), null,
            new[]
            {
                new GeneralJournalWriter.Line(u.CashId, null, 10m, 0m),
                new GeneralJournalWriter.Line(u.EquityId, null, 0m, 10m),
            }));
        await db.SaveChangesAsync();

        var posted = await TestPosting.For(db).PostAsync(Command(u));

        Assert.NotEqual(taken, posted.JournalEntryId);
        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.JournalEntryId == taken));
        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.JournalEntryId == posted.JournalEntryId));
    }

    [Fact]
    public async Task Post_WithSource_StoresSourceJournalEntryIdOnEveryRow()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var posted = await TestPosting.For(db).PostAsync(Command(u, type: "Reversing", source: 77));

        Assert.All(posted.Rows, r => Assert.Equal(77, r.SourceJournalEntryId));
        Assert.Equal("RJ26010001", posted.TransactionNumber);
    }

    [Fact]
    public async Task Replace_ChangesLinesAndDate_KeepsIdNumberAndCreatedAt()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var posted = await posting.PostAsync(Command(u, 100m));

        await using var before = fixture.CreateDb();
        var createdAtBefore = (await before.GeneralJournals.FirstAsync(g => g.JournalEntryId == posted.JournalEntryId)).CreatedAt;

        var replaced = await posting.ReplaceAsync(new ReplaceJournalCommand(
            u.UserId, posted.JournalEntryId, SeededUser.Utc(2026, 1, 9), Lines(u, 400m)));

        Assert.Equal(posted.JournalEntryId, replaced.JournalEntryId);
        Assert.Equal(posted.TransactionNumber, replaced.TransactionNumber);
        Assert.NotNull(replaced.UpdatedAt);

        await using var verify = fixture.CreateDb();
        var rows = await verify.GeneralJournals
            .Where(g => g.UserId == u.UserId && g.JournalEntryId == posted.JournalEntryId)
            .OrderBy(g => g.LineOrder)
            .ToListAsync();
        Assert.Equal(2, rows.Count);
        Assert.Equal(400m, rows.Sum(r => r.Debit));
        Assert.All(rows, r =>
        {
            Assert.Equal(SeededUser.Utc(2026, 1, 9), r.EntryDate);
            Assert.Equal(createdAtBefore, r.CreatedAt);
            Assert.Equal(posted.TransactionNumber, r.TransactionNumber);
            Assert.NotNull(r.UpdatedAt);
        });
    }

    [Fact]
    public async Task Replace_Unbalanced_ThrowsAndKeepsOriginalRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var posted = await posting.PostAsync(Command(u, 100m));

        var bad = new[]
        {
            new JournalLine(u.CashId, null, 500m, 0m),
            new JournalLine(u.EquityId, null, 0m, 400m),
        };

        await Assert.ThrowsAsync<DomainRuleViolation>(() => posting.ReplaceAsync(
            new ReplaceJournalCommand(u.UserId, posted.JournalEntryId, SeededUser.Utc(2026, 1, 5), bad)));

        await using var verify = fixture.CreateDb();
        var rows = await verify.GeneralJournals.Where(g => g.JournalEntryId == posted.JournalEntryId).ToListAsync();
        Assert.Equal(2, rows.Count);
        Assert.Equal(100m, rows.Sum(r => r.Debit));
    }

    [Fact]
    public async Task Replace_EntryOfAnotherUser_ThrowsNotFoundAndKeepsRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var posted = await posting.PostAsync(Command(u, 100m));

        await Assert.ThrowsAsync<KeyNotFoundException>(() => posting.ReplaceAsync(
            new ReplaceJournalCommand(other.UserId, posted.JournalEntryId, SeededUser.Utc(2026, 1, 5), Lines(other, 999m))));

        Assert.Equal(100m, await db.GeneralJournals
            .Where(g => g.JournalEntryId == posted.JournalEntryId)
            .SumAsync(g => g.Debit));
    }

    [Fact]
    public async Task Remove_DeletesAllRowsOfThatEntryOnly()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var first = await posting.PostAsync(Command(u, 100m));
        var second = await posting.PostAsync(Command(u, 200m));

        int removed = await posting.RemoveAsync(u.UserId, first.JournalEntryId);

        Assert.Equal(2, removed);
        await using var verify = fixture.CreateDb();
        Assert.False(await verify.GeneralJournals.AnyAsync(g => g.JournalEntryId == first.JournalEntryId));
        Assert.Equal(2, await verify.GeneralJournals.CountAsync(g => g.JournalEntryId == second.JournalEntryId));
    }

    [Fact]
    public async Task Remove_UnknownEntry_ThrowsNotFound()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => TestPosting.For(db).RemoveAsync(u.UserId, int.MaxValue));
    }

    [Fact]
    public async Task Remove_EntryOfAnotherUser_ThrowsNotFoundAndKeepsRows()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var posted = await posting.PostAsync(Command(u, 100m));

        await Assert.ThrowsAsync<KeyNotFoundException>(() => posting.RemoveAsync(other.UserId, posted.JournalEntryId));

        Assert.Equal(2, await db.GeneralJournals.CountAsync(g => g.JournalEntryId == posted.JournalEntryId));
    }

    [Fact]
    public async Task Remove_AlsoRemovesLedgerRowsOfThatEntry()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var posting = TestPosting.For(db);
        var posted = await posting.PostAsync(Command(u, 100m));

        await new GeneralLedgersService(db).RefreshGeneralLedgersAsync(u.UserId);
        Assert.Equal(2, await db.GeneralLedgerPermanentAccounts.CountAsync(x => x.UserId == u.UserId));

        await posting.RemoveAsync(u.UserId, posted.JournalEntryId);

        await using var verify = fixture.CreateDb();
        Assert.Equal(0, await verify.GeneralLedgerPermanentAccounts.CountAsync(x => x.UserId == u.UserId));
    }
}
