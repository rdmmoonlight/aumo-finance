public class DashboardViewModel
{
    public decimal TotalKasBank { get; set; }
    public decimal PendapatanBulanIni { get; set; }
    public decimal BebanOperasional { get; set; }
    public decimal LabaBersih { get; set; }
    
    // Untuk Grafik
    public List<string> ChartLabels { get; set; } = new();
    public List<decimal> ChartPendapatan { get; set; } = new();
    public List<decimal> ChartBeban { get; set; } = new();
    
    // Untuk Tabel Entri Jurnal Terbaru
    public List<JournalEntryDto> RecentJournals { get; set; } = new();
    
    // Untuk Shortcut COA
    public List<CoaBalanceDto> MainCoaBalances { get; set; } = new();
}

public class JournalEntryDto
{
    public string ReferenceNo { get; set; }
    public DateTime Date { get; set; }
    public string Memo { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
}

public class CoaBalanceDto
{
    public string AccountCode { get; set; }
    public string AccountName { get; set; }
    public string Category { get; set; }
    public decimal Balance { get; set; }
}