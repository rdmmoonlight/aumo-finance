namespace AumoBackend.Test.Unit;

using AumoBackend.Domain;

public class PeriodRulesTests
{
    private static PeriodRange P(int id, int month, bool closed) =>
        new(id, $"2026-{month:00}", new DateTime(2026, month, 1), new DateTime(2026, month, 1).AddMonths(1).AddDays(-1), closed);

    [Fact]
    public void EnsureCanClose_OpenPeriodWithoutEarlierOpen_Passes()
    {
        var jan = P(1, 1, true);
        var feb = P(2, 2, false);
        PeriodRules.EnsureCanClose(feb, new[] { jan, feb });
    }

    [Fact]
    public void EnsureCanClose_FirstPeriod_Passes()
    {
        var jan = P(1, 1, false);
        PeriodRules.EnsureCanClose(jan, new[] { jan });
    }

    [Fact]
    public void EnsureCanClose_AlreadyClosed_Throws()
    {
        var jan = P(1, 1, true);
        var ex = Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsureCanClose(jan, new[] { jan }));
        Assert.Equal("Period 2026-01 is already closed.", ex.Message);
    }

    [Fact]
    public void EnsureCanClose_EarlierPeriodStillOpen_Throws()
    {
        var jan = P(1, 1, false);
        var feb = P(2, 2, false);
        var ex = Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsureCanClose(feb, new[] { jan, feb }));
        Assert.Equal("Cannot close 2026-02: an earlier period is still open. Close earlier periods first.", ex.Message);
    }

    [Fact]
    public void EnsureCanClose_LaterOpenPeriod_DoesNotBlock()
    {
        var jan = P(1, 1, false);
        var feb = P(2, 2, false);
        PeriodRules.EnsureCanClose(jan, new[] { jan, feb });
    }

    [Fact]
    public void HasEarlierOpenPeriod_IgnoresItself()
    {
        var jan = P(1, 1, false);
        Assert.False(PeriodRules.HasEarlierOpenPeriod(jan, new[] { jan }));
    }

    [Fact]
    public void EnsurePreviousClosed_NoPrevious_Passes() =>
        PeriodRules.EnsurePreviousClosed(null, "2026-01");

    [Fact]
    public void EnsurePreviousClosed_PreviousClosed_Passes() =>
        PeriodRules.EnsurePreviousClosed(P(1, 1, true), "2026-02");

    [Fact]
    public void EnsurePreviousClosed_PreviousOpen_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsurePreviousClosed(P(1, 1, false), "2026-02"));
        Assert.Equal("Period 2026-01 must be closed before opening 2026-02.", ex.Message);
    }

    [Fact]
    public void EnsureTrialBalanceBalanced_Equal_Passes() =>
        PeriodRules.EnsureTrialBalanceBalanced("2026-01", 1500.50m, 1500.50m);

    [Fact]
    public void EnsureTrialBalanceBalanced_DifferenceBelowOneCent_Passes() =>
        PeriodRules.EnsureTrialBalanceBalanced("2026-01", 100.001m, 100.002m);

    [Fact]
    public void EnsureTrialBalanceBalanced_Different_ThrowsWithTotals()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsureTrialBalanceBalanced("2026-01", 100m, 90m));
        Assert.Equal(
            "Cannot close 2026-01: the trial balance is not balanced (debit 100.00 vs credit 90.00). Check the journals of this period.",
            ex.Message);
    }

    [Fact]
    public void EnsureTrialBalanceBalanced_UsesStageInMessage()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            PeriodRules.EnsureTrialBalanceBalanced("2026-01", 1m, 2m, "post-closing trial balance"));
        Assert.Contains("post-closing trial balance", ex.Message);
    }

    [Fact]
    public void NetIncome_RevenueMinusExpense_IgnoresPermanentAccounts()
    {
        var rows = new (string? Type, decimal NetBalance)[]
        {
            ("OperatingIncome", 500m),
            ("OtherIncome", 50m),
            ("OperatingExpenses", 300m),
            ("OtherExpenses", 20m),
            ("Assets", 9999m),
            ("Equity", 8888m),
        };

        Assert.Equal(230m, PeriodRules.NetIncome(rows));
    }

    [Fact]
    public void NetIncome_Loss_IsNegative() =>
        Assert.Equal(-40m, PeriodRules.NetIncome(new (string? Type, decimal NetBalance)[] { ("OperatingIncome", 10m), ("OperatingExpenses", 50m) }));

    [Fact]
    public void EnsureCanReceiveNetIncome_ZeroWithoutAccount_Passes() =>
        PeriodRules.EnsureCanReceiveNetIncome("2026-01", 0m, false);

    [Fact]
    public void EnsureCanReceiveNetIncome_NonZeroWithAccount_Passes() =>
        PeriodRules.EnsureCanReceiveNetIncome("2026-01", -75m, true);

    [Fact]
    public void EnsureCanReceiveNetIncome_NonZeroWithoutAccount_Throws()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsureCanReceiveNetIncome("2026-01", 100m, false));
        Assert.Contains("Retained Earnings", ex.Message);
    }

    [Fact]
    public void EnsureClosingGroupBalanced_Unbalanced_ThrowsWithDescription()
    {
        var ex = Assert.Throws<DomainRuleViolation>(() =>
            PeriodRules.EnsureClosingGroupBalanced("2026-01", "Closing Revenue Accounts to Income Summary", 10m, 12m));
        Assert.Contains("Closing Revenue Accounts to Income Summary", ex.Message);
    }

    [Fact]
    public void EnsureClosingGroupBalanced_Balanced_Passes() =>
        PeriodRules.EnsureClosingGroupBalanced("2026-01", "x", 10m, 10m);
}
