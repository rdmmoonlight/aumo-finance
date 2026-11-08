namespace AumoBackend.Test.Unit;

using AumoBackend.Models;
using AumoBackend.Services.Reports.GeneralLedgers;

public class AccountRulesTests
{
    [Theory]
    [InlineData("Assets", 100, true)]
    [InlineData("Assets", 199, true)]
    [InlineData("Assets", 99, false)]
    [InlineData("Assets", 200, false)]
    [InlineData("Liabilities", 200, true)]
    [InlineData("Liabilities", 299, true)]
    [InlineData("Equity", 300, true)]
    [InlineData("Equity", 399, true)]
    [InlineData("OperatingIncome", 400, true)]
    [InlineData("OperatingIncome", 499, true)]
    [InlineData("OperatingExpenses", 500, true)]
    [InlineData("OperatingExpenses", 599, true)]
    [InlineData("OtherIncome", 600, true)]
    [InlineData("OtherIncome", 799, true)]
    [InlineData("OtherIncome", 800, false)]
    [InlineData("OtherExpenses", 800, true)]
    [InlineData("OtherExpenses", 999, true)]
    [InlineData("OtherExpenses", 1000, false)]
    [InlineData("Equity", 200, false)]
    public void ValidateReferenceNumber_FollowsRangePerType(string type, int number, bool expected) =>
        Assert.Equal(expected, AccountClassificationHelper.ValidateReferenceNumber(type, number));

    [Theory]
    [InlineData("Unknown")]
    [InlineData("")]
    [InlineData("assets")]
    public void ValidateReferenceNumber_UnknownOrWrongCaseType_IsInvalid(string type) =>
        Assert.False(AccountClassificationHelper.ValidateReferenceNumber(type, 100));

    [Fact]
    public void AccountTypes_ListsTheSevenCategories() =>
        Assert.Equal(7, AccountClassificationHelper.AccountTypes.Count);

    [Theory]
    [InlineData("Assets", true)]
    [InlineData("OperatingExpenses", true)]
    [InlineData("OtherExpenses", true)]
    [InlineData("Liabilities", false)]
    [InlineData("Equity", false)]
    [InlineData("OperatingIncome", false)]
    [InlineData("OtherIncome", false)]
    public void NormalBalanceIsDebit_ByType(string type, bool expected) =>
        Assert.Equal(expected, AccountClassificationHelper.NormalBalanceIsDebit(type));

    [Theory]
    [InlineData(AccountClassification.Asset, true)]
    [InlineData(AccountClassification.Expense, true)]
    [InlineData(AccountClassification.Liability, false)]
    [InlineData(AccountClassification.Equity, false)]
    [InlineData(AccountClassification.Revenue, false)]
    public void NormalBalanceIsDebit_ByClassification(AccountClassification c, bool expected) =>
        Assert.Equal(expected, c.NormalBalanceIsDebit());

    [Theory]
    [InlineData(AccountClassification.Revenue, true)]
    [InlineData(AccountClassification.Expense, true)]
    [InlineData(AccountClassification.Asset, false)]
    [InlineData(AccountClassification.Liability, false)]
    [InlineData(AccountClassification.Equity, false)]
    public void IsTemporary_OnlyRevenueAndExpense(AccountClassification c, bool expected)
    {
        Assert.Equal(expected, c.IsTemporary());
        Assert.Equal(!expected, c.IsPermanent());
    }

    [Theory]
    [InlineData("Assets", true)]
    [InlineData("Asset", true)]
    [InlineData("OperatingExpenses", true)]
    [InlineData("Expense", true)]
    [InlineData("Liabilities", false)]
    [InlineData("Equity", false)]
    [InlineData("OperatingIncome", false)]
    [InlineData("Revenue", false)]
    public void Ledger_IsDebitNormal_ByType(string type, bool expected) =>
        Assert.Equal(expected, GeneralLedgersService.IsDebitNormal(type));

    // Karakterisasi: tipe tidak dikenal diperlakukan berbeda oleh dua aturan yang sama-sama ada di kode.
    // Buku besar -> kredit normal; AccountClassificationHelper -> debit normal. Diselaraskan pada Fase 2.4.
    [Fact]
    public void UnknownType_LedgerAndHelperDisagree_CurrentBehavior()
    {
        Assert.False(GeneralLedgersService.IsDebitNormal("Unknown"));
        Assert.False(GeneralLedgersService.IsDebitNormal(null));
        Assert.True(AccountClassificationHelper.NormalBalanceIsDebit("Unknown"));
    }
}
