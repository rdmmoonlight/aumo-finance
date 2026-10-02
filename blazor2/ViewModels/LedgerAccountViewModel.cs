namespace AumoBlazor.ViewModels;

public class LedgerTransactionRow
{
    public DateTime Date { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class LedgerAccountViewModel
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal BeginningBalance { get; set; }
    public List<LedgerTransactionRow> Transactions { get; set; } = new();
    public decimal EndingBalance { get; set; }
}
