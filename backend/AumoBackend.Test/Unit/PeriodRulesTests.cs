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
        var ex = Assert.Throws<InvalidOperationException>(() => PeriodRules.EnsureCanClose(jan, new[] { jan }));
        Assert.Equal("Period 2026-01 is already closed.", ex.Message);
    }

    [Fact]
    public void EnsureCanClose_EarlierPeriodStillOpen_Throws()
    {
        var jan = P(1, 1, false);
        var feb = P(2, 2, false);
        var ex = Assert.Throws<InvalidOperationException>(() => PeriodRules.EnsureCanClose(feb, new[] { jan, feb }));
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
        var ex = Assert.Throws<InvalidOperationException>(() => PeriodRules.EnsurePreviousClosed(P(1, 1, false), "2026-02"));
        Assert.Equal("Period 2026-01 must be closed before opening 2026-02.", ex.Message);
    }
}