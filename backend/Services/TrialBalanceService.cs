using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Services;

public record TrialBalanceRow(string Code, string Name, string Type, decimal Debit, decimal Credit, decimal NetBalance);

public interface ITrialBalanceService
{
    Task<List<TrialBalanceRow>> GetUnadjustedAsync(Guid userId, DateTime start, DateTime end);
    Task<List<TrialBalanceRow>> GetAdjustedAsync(Guid userId, DateTime start, DateTime end);
    Task<List<TrialBalanceRow>> GetPostClosingAsync(Guid userId, DateTime end); // khusus post-closing
}

public class TrialBalanceService : ITrialBalanceService
{
    private readonly AppDbContext _db;
    public TrialBalanceService(AppDbContext db) => _db = db;

    public Task<List<TrialBalanceRow>> GetUnadjustedAsync(Guid userId, DateTime start, DateTime end)
        => BuildAsync(userId, end, includeAdjusting: false, includeClosing: false, onlyPermanent: false);

    public Task<List<TrialBalanceRow>> GetAdjustedAsync(Guid userId, DateTime start, DateTime end)
        => BuildAsync(userId, end, includeAdjusting: true, includeClosing: false, onlyPermanent: false);

    public Task<List<TrialBalanceRow>> GetPostClosingAsync(Guid userId, DateTime end)
        => BuildAsync(userId, end, includeAdjusting: true, includeClosing: true, onlyPermanent: true);

    private async Task<List<TrialBalanceRow>> BuildAsync(Guid userId, DateTime end, bool includeAdjusting, bool includeClosing, bool onlyPermanent)
    {
        var accountsQuery = _db.ChartOfAccounts.Where(a => a.UserId == userId && a.IsActive);
        if (onlyPermanent)
        {
            // Post-Closing cuma akun permanen: Assets, Liabilities, Equity
            accountsQuery = accountsQuery.Where(a => a.Type == "Assets" || a.Type == "Liabilities" || a.Type == "Equity");
        }
        var accounts = await accountsQuery.OrderBy(a => a.ReferenceNumber).ToListAsync();

        var linesQuery = _db.JournalEntryLines
            .Include(l => l.JournalEntry)
            .Where(l => l.JournalEntry!.UserId == userId && l.JournalEntry.EntryDate <= end);

        if (!includeAdjusting && !includeClosing)
            linesQuery = linesQuery.Where(l => l.JournalEntry!.JournalType == "General");
        else if (includeAdjusting && !includeClosing)
            linesQuery = linesQuery.Where(l => l.JournalEntry!.JournalType == "General" || l.JournalEntry!.JournalType == "Adjusting");
        // kalau includeClosing = true, ambil semua: General + Adjusting + Closing

        var lines = await linesQuery.ToListAsync();
        var rows = new List<TrialBalanceRow>();

        foreach (var acc in accounts)
        {
            var accLines = lines.Where(l => l.AccountId == acc.Id);
            var totalDebit = accLines.Sum(l => l.Debit);
            var totalCredit = accLines.Sum(l => l.Credit);

            // NET BALANCE - ini yang bener buat TB
            var net = totalDebit - totalCredit; // >0 = debit balance, <0 = credit balance

            decimal d = 0, c = 0;
            if (net > 0) d = net;
            else if (net < 0) c = -net;

            // Post-Closing: skip akun yang 0 biar bersih
            if (d == 0 && c == 0) continue;

            rows.Add(new(acc.ReferenceNumber.ToString(), acc.AccountName, acc.Type!, d, c, net));
        }

        // VALIDASI BALANCE - biar ketahuan kalau masih gak balance
        var sumD = rows.Sum(r => r.Debit);
        var sumC = rows.Sum(r => r.Credit);
        if (sumD != sumC)
        {
            // Log aja, jangan throw, biar frontend bisa tampilin warning
            Console.WriteLine($"[TB WARNING] Tidak balance! D={sumD} C={sumC} Selisih={sumD - sumC}");
        }

        return rows;
    }
}