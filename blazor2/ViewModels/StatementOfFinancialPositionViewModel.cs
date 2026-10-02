namespace AumoBlazor.ViewModels;

public class FinancialPositionLine
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class StatementOfFinancialPositionViewModel
{
    public DateTime AsOfDate { get; set; } = DateTime.Today;
    public bool IsPostClosing { get; set; }
    
    public List<FinancialPositionLine> Assets { get; set; } = new();
    public List<FinancialPositionLine> Liabilities { get; set; } = new();
    public List<FinancialPositionLine> EquityExcludingRetainedEarnings { get; set; } = new();
    
    public decimal RetainedEarningsEnding { get; set; }

    public decimal TotalAssets => Assets.Sum(x => x.Amount);
    public decimal TotalLiabilities => Liabilities.Sum(x => x.Amount);
    public decimal TotalEquity => EquityExcludingRetainedEarnings.Sum(x => x.Amount) + RetainedEarningsEnding;
    public decimal TotalLiabilitiesAndEquity => TotalLiabilities + TotalEquity;

    public bool IsBalanced => TotalAssets == TotalLiabilitiesAndEquity;
}
