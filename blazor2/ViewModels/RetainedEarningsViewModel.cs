namespace AumoBlazor.ViewModels;

public class RetainedEarningsViewModel
{
    public string AccountName { get; set; } = "Retained Earnings";
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime EndDate { get; set; } = DateTime.Today;
    public decimal BeginningBalance { get; set; }
    public decimal NetIncome { get; set; }
    public decimal Dividends { get; set; }

    public decimal EndingBalance => BeginningBalance + NetIncome - Dividends;
}
