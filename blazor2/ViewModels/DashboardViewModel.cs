namespace AumoBlazor.ViewModels;

public class CoaBalanceItem
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class JournalItem
{
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class DashboardViewModel
{
    public bool HasSelectedPeriod { get; set; } = true;
    public string ActivePeriodName { get; set; } = "Januari 2026";
    public DateTime ActivePeriodStart { get; set; } = new DateTime(2026, 1, 1);
    public DateTime ActivePeriodEnd { get; set; } = new DateTime(2026, 1, 31);

    public int FinancialHealthScore { get; set; } = 85;
    public decimal CashRunwayMonths { get; set; } = 12.5m;
    public decimal MonthlyBurnRate { get; set; } = 5000000m;

    public decimal TotalCashAndEquivalents { get; set; }
    public decimal RevenueThisPeriod { get; set; }
    public decimal RevenueTrendPercent { get; set; }
    public decimal OperatingExpenses { get; set; }
    public decimal ExpenseTrendPercent { get; set; }
    public decimal NetIncome { get; set; }
    public decimal NetIncomeTrendPercent { get; set; }

    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }

    public bool HasExpenseData { get; set; } = true;
    public List<CoaBalanceItem> MainCoaBalances { get; set; } = new();
    public List<JournalItem> RecentJournals { get; set; } = new();

    public List<string> ChartLabels { get; set; } = new();
    public List<decimal> ChartRevenue { get; set; } = new();
    public List<decimal> ChartExpenses { get; set; } = new();

    public List<string> ExpenseCategoryLabels { get; set; } = new();
    public List<decimal> ExpenseCategoryValues { get; set; } = new();
}
