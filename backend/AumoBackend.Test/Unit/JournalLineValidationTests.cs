namespace AumoBackend.Test.Unit;

using AumoBackend.DTOs.Reports;
using AumoBackend.Services.JournalEntries;

public class JournalLineValidationTests
{
    private static CreateGeneralJournalLineRequest Line(int account, decimal debit, decimal credit) =>
        new() { AccountId = account, Debit = debit, Credit = credit };

    [Fact]
    public void Balanced_TwoLines_ReturnsBothLines()
    {
        var result = JournalEntryService.ValidateAndExtractLines(new() { Line(1, 100, 0), Line(2, 0, 100) });
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public void BlankLines_AreIgnored()
    {
        var result = JournalEntryService.ValidateAndExtractLines(new()
        {
            Line(1, 100, 0),
            Line(0, 50, 0),   // tanpa akun
            Line(3, 0, 0),    // tanpa nominal
            Line(2, 0, 100),
        });
        Assert.Equal(2, result.Count);
        Assert.DoesNotContain(result, l => l.AccountId == 0 || l.AccountId == 3);
    }

    [Fact]
    public void SingleEffectiveLine_Throws()
    {
        var ex = Assert.Throws<ArgumentException>(() =>
            JournalEntryService.ValidateAndExtractLines(new() { Line(1, 100, 0), Line(2, 0, 0) }));
        Assert.Contains("at least two", ex.Message);
    }

    [Fact]
    public void EmptyList_Throws() =>
        Assert.Throws<ArgumentException>(() => JournalEntryService.ValidateAndExtractLines(new()));

    [Fact]
    public void Unbalanced_Throws()
    {
        var ex = Assert.Throws<ArgumentException>(() =>
            JournalEntryService.ValidateAndExtractLines(new() { Line(1, 100, 0), Line(2, 0, 99) }));
        Assert.Contains("must equal", ex.Message);
    }

    [Fact]
    public void MultipleLinesPerSide_SummedBeforeComparison()
    {
        var result = JournalEntryService.ValidateAndExtractLines(new()
        {
            Line(1, 60, 0), Line(2, 40, 0), Line(3, 0, 100),
        });
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public void DecimalAmounts_CompareExactly()
    {
        var result = JournalEntryService.ValidateAndExtractLines(new()
        {
            Line(1, 0.10m, 0), Line(2, 0.20m, 0), Line(3, 0, 0.30m),
        });
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public void TotalsThatCancelToZero_Throws() =>
        Assert.Throws<ArgumentException>(() =>
            JournalEntryService.ValidateAndExtractLines(new() { Line(1, 100, 0), Line(2, -100, 0) }));
}
