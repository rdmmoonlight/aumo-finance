namespace AumoBlazor.ViewModels;

public class IncomeStatementLine
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal NetBalance { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class IncomeStatementViewModel
{
    public DateTime AsOfDate { get; set; } = DateTime.Today;
    public List<IncomeStatementLine> Revenues { get; set; } = new();
    public List<IncomeStatementLine> OperatingExpenses { get; set; } = new();
    public List<IncomeStatementLine> OtherIncome { get; set; } = new();
    public List<IncomeStatementLine> OtherExpenses { get; set; } = new();

    public decimal TotalRevenue => Revenues.Sum(r => r.Amount);
    public decimal TotalOperatingExpenses => OperatingExpenses.Sum(r => r.Amount);
    public decimal OperatingIncome => TotalRevenue - TotalOperatingExpenses;
    
    public decimal TotalOtherIncome => OtherIncome.Sum(r => r.Amount);
    public decimal TotalOtherExpenses => OtherExpenses.Sum(r => r.Amount);

    public decimal NetIncome => OperatingIncome + TotalOtherIncome - TotalOtherExpenses;
}
