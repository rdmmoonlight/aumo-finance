namespace AumoBackend.Test.Unit;

using AumoBackend.Domain;

public class DomainRuleViolationTests
{
    [Fact]
    public void KeepsMessage() =>
        Assert.Equal("pesan", new DomainRuleViolation("pesan").Message);

    [Fact]
    public void IsInvalidOperationException_SoExistingHttpMappingStillApplies() =>
        Assert.IsAssignableFrom<InvalidOperationException>(new DomainRuleViolation("x"));

    [Fact]
    public void KeepsInnerException()
    {
        var inner = new FormatException("dalam");
        Assert.Same(inner, new DomainRuleViolation("x", inner).InnerException);
    }

    [Fact]
    public void JournalEntry_NullLines_StaysArgumentNullException() =>
        Assert.Throws<ArgumentNullException>(() => JournalEntry.Create(null!));

    [Fact]
    public void PeriodRules_ViolationsAreDomainRuleViolation()
    {
        var closed = new PeriodRange(1, "P1", new DateTime(2026, 1, 1), new DateTime(2026, 1, 31), true);
        Assert.Throws<DomainRuleViolation>(() => PeriodRules.EnsureCanClose(closed, new[] { closed }));
    }
}