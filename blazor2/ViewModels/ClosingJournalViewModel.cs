namespace AumoBlazor.ViewModels;

public class ClosingJournalLine
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class ClosingJournalEntryGroup
{
    public string Title { get; set; } = string.Empty;
    public List<ClosingJournalLine> Lines { get; set; } = new();
}

public class ClosingJournalViewModel
{
    public decimal NetIncome { get; set; }
    public string RetainedEarningsAccountName { get; set; } = "Laba Ditahan";
    public List<ClosingJournalEntryGroup> Groups { get; set; } = new();
}
