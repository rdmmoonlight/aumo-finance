using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public record LedgerTransaction(DateTime Date, string TrxNumber, string Desc, decimal Debit, decimal Credit, decimal RunningBalance);
public record LedgerAccountDto(Guid AccountId, string Code, string Name, string Type, decimal EndingBalance, List<LedgerTransaction> Transactions);

public interface ILedgerService
{
    Task<List<LedgerAccountDto>> GetGeneralLedgerAsync(Guid userId, DateTime start, DateTime end);
}

public class LedgerService : ILedgerService
{
    private readonly AppDbContext _db;
    public LedgerService(AppDbContext db) => _db = db;

    public async Task<List<LedgerAccountDto>> GetGeneralLedgerAsync(Guid userId, DateTime start, DateTime end)
    {
        var accounts = await _db.ChartOfAccounts.Where(a => a.UserId == userId && a.IsActive).OrderBy(a => a.ReferenceNumber).ToListAsync();
        var lines = await _db.JournalEntryLines.Include(l => l.JournalEntry)
            .Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= end)
            .OrderBy(l => l.JournalEntry!.EntryDate)
            .ToListAsync();

        var result = new List<LedgerAccountDto>();
        foreach (var acc in accounts)
        {
            bool isDebit = IsDebitNormal(acc.Type);
            var accLines = lines.Where(l => l.AccountId == acc.Id).ToList();
            
            decimal running = 0;
            var trans = new List<LedgerTransaction>();
            foreach (var l in accLines)
            {
                running += isDebit ? (l.Debit - l.Credit) : (l.Credit - l.Debit);
                if (l.JournalEntry!.EntryDate >= start)
                    trans.Add(new(l.JournalEntry.EntryDate, l.JournalEntry.TransactionNumber, l.JournalEntry.Description, l.Debit, l.Credit, running));
            }
            
            // Skip akun kosong biar ledger gak sampah
            if (trans.Any() || running != 0)
                result.Add(new(acc.Id, acc.ReferenceNumber.ToString(), acc.AccountName, acc.Type!, running, trans));
        }
        return result;
    }

    private static bool IsDebitNormal(string? type) => type is "Assets" or "OperatingExpenses" or "OtherExpenses";
}