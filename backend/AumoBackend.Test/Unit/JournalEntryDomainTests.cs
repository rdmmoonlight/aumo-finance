namespace AumoBackend.Test.Unit;

using AumoBackend.Domain;

public class JournalEntryDomainTests
{
    private static JournalLine Line(int account, decimal debit, decimal credit) =>
        new(account, null, debit, credit);

    [Fact]
    public void Create_BalancedTwoLines_Succeeds()
    {
        var entry = JournalEntry.Create(new[] { Line(1, 100, 0), Line(2, 0, 100) });

        Assert.Equal(2, entry.Lines.Count);
        Assert.Equal(100m, entry.TotalDebit);
        Assert.Equal(100m, entry.TotalCredit);
    }

    [Fact]
    public void Create_MultipleLinesPerSide_AreSummedBeforeComparison()
    {
        var entry = JournalEntry.Create(new[] { Line(1, 60, 0), Line(2, 40, 0), Line(3, 0, 100) });

        Assert.Equal(3, entry.Lines.Count);
        Assert.Equal(100m, entry.TotalDebit);
    }

    [Fact]
    public void Create_KeepsLineOrder()
    {
        var entry = JournalEntry.Create(new[] { Line(7, 0, 100), Line(3, 100, 0) });

        Assert.Equal(new[] { 7, 3 }, entry.Lines.Select(l => l.AccountId).ToArray());
    }

    [Fact]
    public void Create_IgnoresLinesWithoutAccountOrWithoutAmount()
    {
        var entry = JournalEntry.Create(new[]
        {
            Line(1, 100, 0),
            Line(0, 50, 0),   // tanpa akun
            Line(3, 0, 0),    // tanpa nominal
            Line(2, 0, 100),
        });

        Assert.Equal(2, entry.Lines.Count);
        Assert.DoesNotContain(entry.Lines, l => l.AccountId == 0 || l.AccountId == 3);
    }

    [Fact]
    public void Create_Null_ThrowsArgumentNullException() =>
        Assert.Throws<ArgumentNullException>(() => JournalEntry.Create(null!));

    [Fact]
    public void Create_EmptyList_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() => JournalEntry.Create(Array.Empty<JournalLine>()));
        Assert.Contains("at least two", ex.Message);
    }

    [Fact]
    public void Create_SingleEffectiveLine_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100, 0), Line(2, 0, 0) }));
        Assert.Contains("at least two", ex.Message);
    }

    [Fact]
    public void Create_Unbalanced_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100, 0), Line(2, 0, 99) }));
        Assert.Contains("must equal", ex.Message);
    }

    [Fact]
    public void Create_DecimalAmounts_CompareExactly()
    {
        var entry = JournalEntry.Create(new[] { Line(1, 0.10m, 0), Line(2, 0.20m, 0), Line(3, 0, 0.30m) });

        Assert.Equal(0.30m, entry.TotalDebit);
        Assert.Equal(0.30m, entry.TotalCredit);
    }

    [Fact]
    public void Create_NegativeDebit_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100, 0), Line(2, -100, 0) }));
        Assert.Contains("cannot be negative", ex.Message);
    }

    [Fact]
    public void Create_NegativeCredit_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100, 0), Line(2, 0, -100) }));
        Assert.Contains("cannot be negative", ex.Message);
    }

    [Fact]
    public void Create_LineWithDebitAndCredit_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100, 100), Line(2, 0, 0.01m), Line(3, 0.01m, 0) }));
        Assert.Contains("both a debit and a credit", ex.Message);
    }

    [Fact]
    public void Create_MoreThanTwoDecimals_IsRejectedNotRounded()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[] { Line(1, 100.001m, 0), Line(2, 0, 100.001m) }));
        Assert.Contains("2 decimal places", ex.Message);
    }

    [Fact]
    public void IsValidAmount_TrailingZeros_AreNotCounted() =>
        Assert.True(JournalEntry.IsValidAmount(1.100m));

    [Fact]
    public void IsValidAmount_ThreeSignificantDecimals_IsRejected() =>
        Assert.False(JournalEntry.IsValidAmount(1.001m));

    [Fact]
    public void IsValidAmount_LargestAllowedValue_IsAccepted() =>
        Assert.True(JournalEntry.IsValidAmount(9_999_999_999_999_999.99m));

    [Fact]
    public void IsValidAmount_TenToThePowerSixteen_IsRejected() =>
        Assert.False(JournalEntry.IsValidAmount(10_000_000_000_000_000m));

    [Fact]
    public void Create_AmountBeyondSixteenIntegerDigits_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            JournalEntry.Create(new[]
            {
                Line(1, 10_000_000_000_000_000m, 0),
                Line(2, 0, 10_000_000_000_000_000m),
            }));
        Assert.Contains("16 digits", ex.Message);
    }

    [Fact]
    public void Create_LargestAllowedAmount_Succeeds()
    {
        var entry = JournalEntry.Create(new[]
        {
            Line(1, 9_999_999_999_999_999.99m, 0),
            Line(2, 0, 9_999_999_999_999_999.99m),
        });

        Assert.Equal(9_999_999_999_999_999.99m, entry.TotalDebit);
    }
}