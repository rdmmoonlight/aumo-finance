namespace AumoBackend.DTOs.Reports;

public class WorksheetRowApiResponse
{
    public int AccountId { get; set; }

    public int ReferenceNumber { get; set; }

    public string AccountName { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public bool NormalBalanceIsDebit { get; set; }

    public decimal UnadjustedDebit { get; set; }

    public decimal UnadjustedCredit { get; set; }

    public decimal AdjustmentDebit { get; set; }

    public decimal AdjustmentCredit { get; set; }

    public decimal AdjustingDebit { get; set; }

    public decimal AdjustingCredit { get; set; }

    public decimal AdjustedDebit { get; set; }

    public decimal AdjustedCredit { get; set; }

    public decimal IncomeStatementDebit { get; set; }

    public decimal IncomeStatementCredit { get; set; }

    public decimal BalanceSheetDebit { get; set; }

    public decimal BalanceSheetCredit { get; set; }

    public decimal FinancialPositionDebit { get; set; }

    public decimal FinancialPositionCredit { get; set; }
}

public class WorksheetResponseDto
{
    public bool Success { get; set; }
    public bool HasPeriodSelected { get; set; }
    public string? SelectedPeriodName { get; set; }
    public string? Message { get; set; }
    public IReadOnlyList<WorksheetRowDto> Rows { get; set; } = [];
    public WorksheetTotalsDto? Totals { get; set; }
}

public class WorksheetRowDto
{
    public Guid AccountId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool NormalBalanceIsDebit { get; set; }

    public decimal UnadjustedDebit { get; set; }
    public decimal UnadjustedCredit { get; set; }
    public decimal AdjustmentDebit { get; set; }
    public decimal AdjustmentCredit { get; set; }
    public decimal AdjustedDebit { get; set; }
    public decimal AdjustedCredit { get; set; }
    public decimal IncomeStatementDebit { get; set; }
    public decimal IncomeStatementCredit { get; set; }
    public decimal FinancialPositionDebit { get; set; }
    public decimal FinancialPositionCredit { get; set; }
}

public class WorksheetTotalsDto
{
    public static WorksheetTotalsDto Empty => new();
    public decimal UnadjustedDebit { get; set; }
    public decimal UnadjustedCredit { get; set; }
    public decimal AdjustmentDebit { get; set; }
    public decimal AdjustmentCredit { get; set; }
    public decimal AdjustedDebit { get; set; }
    public decimal AdjustedCredit { get; set; }
    public decimal IncomeStatementDebit { get; set; }
    public decimal IncomeStatementCredit { get; set; }
    public decimal FinancialPositionDebit { get; set; }
    public decimal FinancialPositionCredit { get; set; }
    public decimal NetIncome { get; set; }
}