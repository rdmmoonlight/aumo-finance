namespace AumoBackend.Test.Unit;

using AumoBackend.Domain;

public class AccountTypeDomainTests
{
    [Fact]
    public void All_ListsSevenCategoriesInRangeOrder() =>
        Assert.Equal(
            new[] { "Assets", "Liabilities", "Equity", "OperatingIncome", "OperatingExpenses", "OtherIncome", "OtherExpenses" },
            AccountType.All);

    [Fact]
    public void PermanentAndTemporary_PartitionAllTypes()
    {
        Assert.Equal(new[] { "Assets", "Liabilities", "Equity" }, AccountType.PermanentTypes);
        Assert.Equal(new[] { "OperatingIncome", "OtherIncome", "OperatingExpenses", "OtherExpenses" }, AccountType.TemporaryTypes);
        Assert.Empty(AccountType.PermanentTypes.Intersect(AccountType.TemporaryTypes));
        Assert.Equal(AccountType.All.Count, AccountType.PermanentTypes.Count + AccountType.TemporaryTypes.Count);
    }

    [Theory]
    [InlineData("Assets", true, false)]
    [InlineData("Liabilities", true, false)]
    [InlineData("Equity", true, false)]
    [InlineData("OperatingIncome", false, true)]
    [InlineData("OtherIncome", false, true)]
    [InlineData("OperatingExpenses", false, true)]
    [InlineData("OtherExpenses", false, true)]
    [InlineData("assets", false, false)]
    [InlineData("Unknown", false, false)]
    [InlineData("", false, false)]
    [InlineData(null, false, false)]
    public void IsPermanent_IsTemporary_AreStrict(string? type, bool permanent, bool temporary)
    {
        Assert.Equal(permanent, AccountType.IsPermanent(type));
        Assert.Equal(temporary, AccountType.IsTemporary(type));
    }

    [Theory]
    [InlineData("Assets", true)]
    [InlineData("OperatingExpenses", true)]
    [InlineData("OtherExpenses", true)]
    [InlineData("Liabilities", false)]
    [InlineData("Equity", false)]
    [InlineData("OperatingIncome", false)]
    [InlineData("OtherIncome", false)]
    [InlineData("Unknown", false)]
    [InlineData(null, false)]
    public void IsDebitNormal_ByType(string? type, bool expected) =>
        Assert.Equal(expected, AccountType.IsDebitNormal(type));

    [Theory]
    [InlineData("OperatingIncome", true, false)]
    [InlineData("OtherIncome", true, false)]
    [InlineData("OperatingExpenses", false, true)]
    [InlineData("OtherExpenses", false, true)]
    [InlineData("Assets", false, false)]
    public void IsRevenue_IsExpense(string type, bool revenue, bool expense)
    {
        Assert.Equal(revenue, AccountType.IsRevenue(type));
        Assert.Equal(expense, AccountType.IsExpense(type));
    }

    [Theory]
    [InlineData("Assets", 100, 199)]
    [InlineData("Liabilities", 200, 299)]
    [InlineData("Equity", 300, 399)]
    [InlineData("OperatingIncome", 400, 499)]
    [InlineData("OperatingExpenses", 500, 599)]
    [InlineData("OtherIncome", 600, 799)]
    [InlineData("OtherExpenses", 800, 999)]
    public void ReferenceRange_PerType(string type, int start, int end)
    {
        Assert.True(AccountType.TryGetReferenceRange(type, out var s, out var e));
        Assert.Equal((start, end), (s, e));
        Assert.True(AccountType.IsReferenceNumberValid(type, start));
        Assert.True(AccountType.IsReferenceNumberValid(type, end));
        Assert.False(AccountType.IsReferenceNumberValid(type, start - 1));
        Assert.False(AccountType.IsReferenceNumberValid(type, end + 1));
    }

    [Fact]
    public void ReferenceRanges_CoverHundredToNineNinetyNineWithoutOverlap()
    {
        var covered = AccountType.All
            .Select(t => { AccountType.TryGetReferenceRange(t, out var s, out var e); return (s, e); })
            .OrderBy(r => r.s)
            .ToList();

        Assert.Equal(100, covered.First().s);
        Assert.Equal(999, covered.Last().e);
        for (int i = 1; i < covered.Count; i++)
        {
            Assert.Equal(covered[i - 1].e + 1, covered[i].s);
        }
    }

    [Theory]
    [InlineData("Unknown")]
    [InlineData("assets")]
    [InlineData("")]
    [InlineData(null)]
    public void UnknownType_HasNoRangeAndIsNotKnown(string? type)
    {
        Assert.False(AccountType.IsKnown(type));
        Assert.False(AccountType.TryGetReferenceRange(type, out _, out _));
        Assert.False(AccountType.IsReferenceNumberValid(type, 100));
    }

    [Theory]
    [InlineData("Assets", "Assets")]
    [InlineData("assets", "Assets")]
    [InlineData("Asset", "Assets")]
    [InlineData("Liability", "Liabilities")]
    [InlineData("EQUITY", "Equity")]
    [InlineData("Income", "OperatingIncome")]
    [InlineData("Revenue", "OperatingIncome")]
    [InlineData("OtherIncome", "OtherIncome")]
    [InlineData("Expense", "OperatingExpenses")]
    [InlineData("Expenses", "OperatingExpenses")]
    [InlineData("OtherExpenses", "OtherExpenses")]
    [InlineData("Unknown", null)]
    [InlineData("", null)]
    [InlineData(null, null)]
    public void Normalize_MapsLegacyNamesToCanonical(string? input, string? expected) =>
        Assert.Equal(expected, AccountType.Normalize(input));
}
