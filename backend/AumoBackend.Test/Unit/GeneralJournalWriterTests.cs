namespace AumoBackend.Test.Unit;

using AumoBackend.Services.JournalEntries;

public class GeneralJournalWriterTests
{
    private static readonly Guid User = Guid.NewGuid();
    private static readonly DateTime Entry = new(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime Created = new(2026, 1, 5, 8, 0, 0, DateTimeKind.Utc);

    private static List<AumoBackend.Models.GeneralJournal> Build(string status = GeneralJournalWriter.PostedStatus, DateTime? updated = null) =>
        GeneralJournalWriter.BuildRows(
            42, User, "GJ26010001", "General", Entry, Created, updated,
            new[]
            {
                new GeneralJournalWriter.Line(10, "Kas masuk", 100m, 0m),
                new GeneralJournalWriter.Line(20, null, 0m, 100m),
            },
            status);

    [Fact]
    public void BuildRows_CopiesHeaderToEveryRow()
    {
        var rows = Build();
        Assert.Equal(2, rows.Count);
        Assert.All(rows, r =>
        {
            Assert.Equal(42, r.JournalEntryId);
            Assert.Equal(User, r.UserId);
            Assert.Equal("GJ26010001", r.TransactionNumber);
            Assert.Equal("General", r.JournalType);
            Assert.Equal(Entry, r.EntryDate);
            Assert.Equal(Created, r.CreatedAt);
        });
    }

    [Fact]
    public void BuildRows_AssignsSequentialLineOrderFromZero() =>
        Assert.Equal(new[] { 0, 1 }, Build().Select(r => r.LineOrder).ToArray());

    [Fact]
    public void BuildRows_MapsLineValues()
    {
        var rows = Build();
        Assert.Equal(10, rows[0].AccountId);
        Assert.Equal("Kas masuk", rows[0].LineDescription);
        Assert.Equal(100m, rows[0].Debit);
        Assert.Equal(0m, rows[0].Credit);
        Assert.Null(rows[1].LineDescription);
        Assert.Equal(100m, rows[1].Credit);
    }

    [Fact]
    public void BuildRows_DefaultStatusIsPosted() =>
        Assert.All(Build(), r => Assert.Equal("Posted", r.Status));

    [Fact]
    public void BuildRows_CustomStatusAndUpdatedAt_AreKept()
    {
        var updated = Created.AddDays(1);
        var rows = Build("Draft", updated);
        Assert.All(rows, r =>
        {
            Assert.Equal("Draft", r.Status);
            Assert.Equal(updated, r.UpdatedAt);
        });
    }
}
