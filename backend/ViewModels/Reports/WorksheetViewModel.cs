using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System.Collections.Generic;
using System.Linq;

namespace AumoBackend.ViewModels.Reports;

public class WorksheetRow
{
    public int AccountId { get; set; }
    public string? ReferenceNumber { get; set; }
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

public class WorksheetViewModel
{
    public List<WorksheetRow> Rows { get; set; } = new();
    public decimal NetIncome { get; set; }

    public decimal TotalUnadjustedDebit => Rows.Sum(r => r.UnadjustedDebit);
    public decimal TotalUnadjustedCredit => Rows.Sum(r => r.UnadjustedCredit);

    public decimal TotalAdjustmentDebit => Rows.Sum(r => r.AdjustmentDebit);
    public decimal TotalAdjustmentCredit => Rows.Sum(r => r.AdjustmentCredit);

    public decimal TotalAdjustedDebit => Rows.Sum(r => r.AdjustedDebit);
    public decimal TotalAdjustedCredit => Rows.Sum(r => r.AdjustedCredit);

    public decimal TotalIncomeStatementDebit => Rows.Sum(r => r.IncomeStatementDebit);
    public decimal TotalIncomeStatementCredit => Rows.Sum(r => r.IncomeStatementCredit);

    public decimal TotalFinancialPositionDebit => Rows.Sum(r => r.FinancialPositionDebit);
    public decimal TotalFinancialPositionCredit => Rows.Sum(r => r.FinancialPositionCredit);
}

public class ClosingJournalLine
{
    public string? ReferenceNumber { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class ClosingJournalEntryGroup
{
    public string Description { get; set; } = string.Empty;
    public List<ClosingJournalLine> Lines { get; set; } = new();
    public decimal TotalDebit => Lines.Sum(l => l.Debit);
    public decimal TotalCredit => Lines.Sum(l => l.Credit);
}

public class ClosingJournalViewModel
{
    public List<ClosingJournalEntryGroup> Groups { get; set; } = new();
    public decimal NetIncome { get; set; }
    public string RetainedEarningsAccountName { get; set; } = "Retained Earnings";
}
