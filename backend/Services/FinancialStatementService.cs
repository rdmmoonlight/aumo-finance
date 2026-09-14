using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public record IncomeStatementDto(decimal Revenue, decimal Expenses, decimal NetIncome, List<(string Name, decimal Amount)> RevenueDetails, List<(string Name, decimal Amount)> ExpenseDetails);
public record BalanceSheetDto(decimal Assets, decimal Liabilities, decimal Equity);

public interface IFinancialStatementService
{
    Task<IncomeStatementDto> GetIncomeStatementAsync(Guid userId, DateTime start, DateTime end);
    Task<BalanceSheetDto> GetBalanceSheetAsync(Guid userId, DateTime end);
}

public class FinancialStatementService : IFinancialStatementService
{
    private readonly AppDbContext _db;
    public FinancialStatementService(AppDbContext db) => _db = db;

    public async Task<IncomeStatementDto> GetIncomeStatementAsync(Guid userId, DateTime start, DateTime end)
    {
        var accounts = await _db.ChartOfAccounts.Where(a => a.UserId == userId).ToListAsync();
        var lines = await _db.JournalEntryLines.Include(l => l.JournalEntry).Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate >= start && l.JournalEntry.EntryDate <= end).ToListAsync();

        decimal Sum(string type) => lines.Where(l => accounts.Any(a => a.Id == l.AccountId && a.Type == type)).Sum(l => l.Credit - l.Debit);
        decimal SumExp(string type) => lines.Where(l => accounts.Any(a => a.Id == l.AccountId && a.Type == type)).Sum(l => l.Debit - l.Credit);

        var rev = Sum("OperatingIncome") + Sum("OtherIncome");
        var exp = SumExp("OperatingExpenses") + SumExp("OtherExpenses");

        return new(rev, exp, rev - exp, new(), new());
    }

    public async Task<BalanceSheetDto> GetBalanceSheetAsync(Guid userId, DateTime end)
    {
        var accounts = await _db.ChartOfAccounts.Where(a => a.UserId == userId).ToListAsync();
        var lines = await _db.JournalEntryLines.Include(l => l.JournalEntry).Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= end).ToListAsync();

        decimal Bal(string type, bool isDebitNormal)
        {
            var ids = accounts.Where(a => a.Type == type).Select(a => a.Id).ToHashSet();
            var rel = lines.Where(l => ids.Contains(l.AccountId));
            return isDebitNormal ? rel.Sum(l => l.Debit - l.Credit) : rel.Sum(l => l.Credit - l.Debit);
        }

        var assets = Bal("Assets", true);
        var liab = Bal("Liabilities", false);
        var equity = Bal("Equity", false);
        // Equity akan include Net Income jika closing belum dilakukan, tergantung flow lu

        return new(assets, liab, equity);
    }
}