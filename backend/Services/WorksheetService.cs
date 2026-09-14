using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public record WorksheetRow(string Code, string Name, decimal TrialDebit, decimal TrialCredit, decimal AdjDebit, decimal AdjCredit, decimal AdjTrialDebit, decimal AdjTrialCredit, decimal IncomeDebit, decimal IncomeCredit, decimal BalanceDebit, decimal BalanceCredit);
public record WorksheetViewModel(List<WorksheetRow> Rows, decimal TotalTrialD, decimal TotalTrialC);

public interface IWorksheetService
{
    Task<WorksheetViewModel> GetWorksheetAsync(Guid userId, DateTime start, DateTime end);
}

public class WorksheetService : IWorksheetService
{
    private readonly AppDbContext _db;
    public WorksheetService(AppDbContext db) => _db = db;

    public async Task<WorksheetViewModel> GetWorksheetAsync(Guid userId, DateTime start, DateTime end)
    {
        var accounts = await _db.ChartOfAccounts.Where(a => a.UserId == userId).OrderBy(a => a.ReferenceNumber).ToListAsync();
        var allLines = await _db.JournalEntryLines.Include(l => l.JournalEntry).Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= end).ToListAsync();

        var rows = new List<WorksheetRow>();
        foreach (var acc in accounts)
        {
            var general = allLines.Where(l => l.AccountId == acc.Id && l.JournalEntry!.JournalType == "General");
            var adjusting = allLines.Where(l => l.AccountId == acc.Id && l.JournalEntry!.JournalType == "Adjusting");

            decimal td = general.Sum(l => l.Debit), tc = general.Sum(l => l.Credit);
            decimal ad = adjusting.Sum(l => l.Debit), ac = adjusting.Sum(l => l.Credit);
            decimal atd = td + ad, atc = tc + ac;

            if (td == 0 && tc == 0 && ad == 0 && ac == 0) continue;

            decimal incD = 0, incC = 0, balD = 0, balC = 0;
            if (acc.Type is "OperatingIncome" or "OtherIncome" or "OperatingExpenses" or "OtherExpenses")
            {
                incD = atd; incC = atc;
            }
            else
            {
                balD = atd; balC = atc;
            }

            rows.Add(new(acc.ReferenceNumber.ToString(), acc.AccountName, td, tc, ad, ac, atd, atc, incD, incC, balD, balC));
        }

        return new(rows, rows.Sum(r => r.TrialDebit), rows.Sum(r => r.TrialCredit));
    }
}