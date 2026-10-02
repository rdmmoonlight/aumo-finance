namespace AumoBlazor.ViewModels;

public class CashFlowLine
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class CashFlowStatementViewModel
{
    public List<CashFlowLine> OperatingActivities { get; set; } = new();
    public List<CashFlowLine> InvestingActivities { get; set; } = new();
    public List<CashFlowLine> FinancingActivities { get; set; } = new();

    public decimal NetOperating => OperatingActivities.Sum(x => x.Amount);
    public decimal NetInvesting => InvestingActivities.Sum(x => x.Amount);
    public decimal NetFinancing => FinancingActivities.Sum(x => x.Amount);

    public decimal NetChangeInCash => NetOperating + NetInvesting + NetFinancing;
    public decimal BeginningCash { get; set; }
    public decimal EndingCash => BeginningCash + NetChangeInCash;
}
