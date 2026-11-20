namespace AumoBackend.Services.Reports.Journals;

using System.Globalization;
using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.JournalEntry;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.EntityFrameworkCore;

public partial class JournalsService : IJournalsService
{
    private readonly AppDbContext _db;
    private readonly ITrialBalancesService _trialBalancesService;
    private readonly ITransactionNumberService _transactionNumberService;

    public JournalsService(
    AppDbContext db,
    ITrialBalancesService trialBalancesService,
    ITransactionNumberService transactionNumberService)
    {
        _db = db;
        _trialBalancesService = trialBalancesService;
        _transactionNumberService = transactionNumberService;
    }

    public async Task<JournalReportResult> GetJournalAsync(Guid userId, string journalType)
    {
        var period = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (period == null)
        {
            return new JournalReportResult { HasPeriodSelected = false };
        }

        var startUtc = DateTime.SpecifyKind(period.StartDate.Date, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(period.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var rows = await _db.GeneralJournals
            .AsNoTracking()
            .Include(g => g.Account)
            .Where(g => g.UserId == userId
                     && g.JournalType == journalType
                     && g.EntryDate >= startUtc
                     && g.EntryDate <= endUtc)
            .ToListAsync();

        var entries = rows
            .GroupBy(g => g.JournalEntryId)
            .Select(grp => new { Header = grp.First(), Lines = grp })
            .OrderBy(x => x.Header.EntryDate)
            .ThenBy(x => x.Header.CreatedAt)
            .ThenBy(x => x.Header.JournalEntryId)
            .Select(x => new JournalReportEntryDto
            {
                Id = x.Header.JournalEntryId,
                TransactionNumber = x.Header.TransactionNumber,
                JournalType = x.Header.JournalType,
                EntryDate = x.Header.EntryDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                CreatedAt = x.Header.CreatedAt,
                UpdatedAt = x.Header.UpdatedAt,
                Lines = x.Lines
                    .OrderBy(l => l.LineOrder)
                    .Select(l => new JournalReportLineDto
                    {
                        Id = l.LineId,
                        AccountId = l.AccountId,
                        AccountName = l.Account != null ? l.Account.AccountName : "Unknown",
                        ReferenceNumber = l.Account != null ? l.Account.ReferenceNumber.ToString(CultureInfo.InvariantCulture) : "0",
                        LineDescription = l.LineDescription,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        LineOrder = l.LineOrder,
                    })
                    .ToList(),
            })
            .ToList();

        return new JournalReportResult
        {
            HasPeriodSelected = true,
            SelectedPeriodName = period.PeriodName,
            IsPeriodClosed = period.IsClosed,
            Entries = entries,
        };
    }
}
