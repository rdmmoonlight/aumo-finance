namespace AumoBackend.DTOs.Reports;

public class TrialBalancesRow
{
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public int PeriodId { get; set; }

    public string AccountNumber { get; set; } = string.Empty;

    public string AccountName { get; set; } = string.Empty;

    public decimal DebitBalance { get; set; }

    public decimal CreditBalance { get; set; }

    public bool IsTotalRow { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public class TrialBalanceRow
{
    public int AccountId { get; set; }

    public string ReferenceNumber { get; set; } = string.Empty;

    public string AccountName { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string? Role { get; set; }

    public bool NormalBalanceIsDebit { get; set; }

    public decimal NetBalance { get; set; }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }
}

public class TrialBalanceUnadjustedRow : TrialBalancesRow
{
}

public class TrialBalanceAdjustedRow : TrialBalancesRow
{
}

public class TrialBalancePostClosingRow : TrialBalancesRow
{
}
