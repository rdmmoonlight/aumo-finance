namespace AumoBackend.Test.Unit;

using AumoBackend.Models;

public class PeriodLockTests
{
    private static Period MakePeriod(DateTime start, DateTime end, bool closed) => new()
    {
        PeriodName = "Uji",
        StartDate = start,
        EndDate = end,
        IsClosed = closed,
    };

    private static readonly DateTime Start = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime End = new(2026, 1, 31, 0, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsLocked_NullPeriod_ReturnsFalse() => Assert.False(PeriodLock.IsLocked((Period?)null));

    [Fact]
    public void IsLocked_ClosedPeriod_ReturnsTrue() => Assert.True(PeriodLock.IsLocked(MakePeriod(Start, End, true)));

    [Fact]
    public void IsLocked_OpenPeriod_ReturnsFalse() => Assert.False(PeriodLock.IsLocked(MakePeriod(Start, End, false)));

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void IsLocked_Bool_ReturnsSameValue(bool closed) => Assert.Equal(closed, PeriodLock.IsLocked(closed));

    [Fact]
    public void IsDateLocked_NullList_ReturnsFalse() => Assert.False(PeriodLock.IsDateLocked(Start, null));

    [Fact]
    public void IsDateLocked_EmptyList_ReturnsFalse() => Assert.False(PeriodLock.IsDateLocked(Start, new List<Period>()));

    [Fact]
    public void IsDateLocked_DateInsideClosedPeriod_ReturnsTrue()
    {
        var periods = new[] { MakePeriod(Start, End, true) };
        Assert.True(PeriodLock.IsDateLocked(new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc), periods));
    }

    [Fact]
    public void IsDateLocked_StartAndEndBoundaries_AreInclusive()
    {
        var periods = new[] { MakePeriod(Start, End, true) };
        Assert.True(PeriodLock.IsDateLocked(Start, periods));
        Assert.True(PeriodLock.IsDateLocked(End, periods));
    }

    [Fact]
    public void IsDateLocked_DateOutsideClosedPeriod_ReturnsFalse()
    {
        var periods = new[] { MakePeriod(Start, End, true) };
        Assert.False(PeriodLock.IsDateLocked(Start.AddDays(-1), periods));
        Assert.False(PeriodLock.IsDateLocked(End.AddDays(1), periods));
    }

    [Fact]
    public void IsDateLocked_DateInsideOpenPeriod_ReturnsFalse()
    {
        var periods = new[] { MakePeriod(Start, End, false) };
        Assert.False(PeriodLock.IsDateLocked(new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc), periods));
    }

    [Fact]
    public void IsDateLocked_OnlyOneOfManyPeriodsMatches_ReturnsTrue()
    {
        var feb = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc);
        var periods = new[]
        {
            MakePeriod(Start, End, false),
            MakePeriod(feb, feb.AddDays(27), true),
        };
        Assert.True(PeriodLock.IsDateLocked(feb.AddDays(3), periods));
        Assert.False(PeriodLock.IsDateLocked(Start.AddDays(3), periods));
    }

    // Karakterisasi perilaku saat ini: tanggal dengan jam setelah 00:00 pada hari terakhir
    // berada di luar periode, karena pembanding memakai DateTime lengkap (bukan .Date).
    [Fact]
    public void IsDateLocked_TimeAfterMidnightOnLastDay_IsNotLocked_CurrentBehavior()
    {
        var periods = new[] { MakePeriod(Start, End, true) };
        Assert.False(PeriodLock.IsDateLocked(End.AddHours(10), periods));
    }
}
