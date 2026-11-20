namespace AumoBackend.Services.JournalEntry;

public class JournalEntryService : IJournalEntryService
{
    private readonly AppDbContext db;
    private readonly ITransactionNumberService transactionNumberService;

    public JournalEntryService(AppDbContext db, ITransactionNumberService transactionNumberService)
    {
        this.db = db;
        this.transactionNumberService = transactionNumberService;
    }

    public async Task<GeneralJournalResponseDto?> GetByIdAsync(Guid userId, int id)
    {
        var rows = await this.db.GeneralJournals
            .Where(gj => gj.JournalEntryId == id && gj.UserId == userId)
            .OrderBy(gj => gj.LineOrder)
            .ToListAsync();

        if (rows.Count == 0)
        {
            return null;
        }

        var firstRow = rows.First();

        var closedPeriods = await this.db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        bool isLocked = PeriodLock.IsDateLocked(firstRow.EntryDate, closedPeriods);

        return new GeneralJournalResponseDto
        {
            Id = firstRow.JournalEntryId,
            TransactionNumber = firstRow.TransactionNumber,
            JournalType = firstRow.JournalType,
            EntryDate = firstRow.EntryDate,
            CreatedAt = firstRow.CreatedAt,
            UpdatedAt = firstRow.UpdatedAt,
            IsLocked = isLocked,
            Lines = rows.Select(l => new GeneralJournalLineDto
            {
                Id = l.LineId,
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = l.LineOrder
            }).ToList(),
        };
    }

    public async Task<List<GeneralJournalResponseDto>> GetByTransactionNumberAsync(Guid userId, string transactionNumber)
    {
        var rows = await this.db.GeneralJournals
            .Where(gj => gj.TransactionNumber == transactionNumber && gj.UserId == userId)
            .OrderBy(gj => gj.LineOrder)
            .ToListAsync();

        if (rows.Count == 0)
        {
            return new List<GeneralJournalResponseDto>();
        }

        var closedPeriods = await this.db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        return rows
            .GroupBy(row => row.JournalEntryId)
            .Select(group =>
            {
                var firstRow = group.First();
                return new GeneralJournalResponseDto
                {
                    Id = firstRow.JournalEntryId,
                    TransactionNumber = firstRow.TransactionNumber,
                    JournalType = firstRow.JournalType,
                    EntryDate = firstRow.EntryDate,
                    CreatedAt = firstRow.CreatedAt,
                    UpdatedAt = firstRow.UpdatedAt,
                    IsLocked = PeriodLock.IsDateLocked(firstRow.EntryDate, closedPeriods),
                    Lines = group.Select(l => new GeneralJournalLineDto
                    {
                        Id = l.LineId,
                        AccountId = l.AccountId,
                        LineDescription = l.LineDescription,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        LineOrder = l.LineOrder
                    }).ToList(),
                };
            })
            .ToList();
    }

    public async Task<GeneralJournalResponseDto> CreateAsync(Guid userId, CreateGeneralJournalRequest request)
    {
        var effectiveLines = ValidateAndExtractLines(request.Lines);
        await this.ValidateAccountsAsync(userId, effectiveLines);

        var closedPeriods = await this.db.Periods
            .Where(p => p.UserId == userId && p.IsClosed)
            .ToListAsync();

        if (PeriodLock.IsDateLocked(request.EntryDate, closedPeriods))
        {
            throw new DomainRuleViolation("This date falls within a closed accounting period. Choose a date in an open period.");
        }

        string journalType = string.IsNullOrWhiteSpace(request.JournalType) ? "General" : request.JournalType;
        string transactionNumber = await this.transactionNumberService.GenerateAsync(userId, journalType, request.EntryDate);

        var deviceCreatedAt = request.CreatedAt == default ? DateTime.UtcNow : request.CreatedAt;
        var entryDate = DateTime.SpecifyKind(request.EntryDate, DateTimeKind.Utc);
        var createdAt = DateTime.SpecifyKind(deviceCreatedAt, DateTimeKind.Utc);

        int journalEntryId = await GeneralJournalWriter.NextJournalEntryIdAsync(this.db);

        var rows = GeneralJournalWriter.BuildRows(
            journalEntryId, userId, transactionNumber, journalType, entryDate, createdAt, null,
            effectiveLines.Select(l => new GeneralJournalWriter.Line(l.AccountId, l.LineDescription, l.Debit, l.Credit)));

        this.db.GeneralJournals.AddRange(rows);
        await this.db.SaveChangesAsync();

        return new GeneralJournalResponseDto
        {
            Id = journalEntryId,
            TransactionNumber = transactionNumber,
            JournalType = journalType,
            EntryDate = entryDate,
            CreatedAt = createdAt,
            UpdatedAt = null,
            IsLocked = false,
            Lines = rows.Select(l => new GeneralJournalLineDto
            {
                Id = l.LineId,
                AccountId = l.AccountId,
                LineDescription = l.LineDescription,
                Debit = l.Debit,
                Credit = l.Credit,
                LineOrder = l.LineOrder
            }).ToList(),
        };
    }

    public async Task<List<string>> SearchLineDescriptionsAsync(Guid userId, string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return new List<string>();
        }

        var keyword = query.Trim();

        return await this.db.GeneralJournals
            .Where(gj => gj.UserId == userId
                      && gj.LineDescription != null && gj.LineDescription != string.Empty
                      && EF.Functions.ILike(gj.LineDescription, $"%{keyword}%"))
            .GroupBy(gj => gj.LineDescription)
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Max(gj => gj.LineId))
            .Select(g => g.Key!)
            .Take(8)
            .ToListAsync();
    }

    public async Task<string> GetNextTransactionNumberAsync(Guid userId, string journalType, DateTime? entryDate)
    {
        string type = string.IsNullOrWhiteSpace(journalType) ? "General" : journalType;
        return await this.transactionNumberService.PeekNextAsync(userId, type, entryDate ?? DateTime.Today);
    }

    internal static List<CreateGeneralJournalLineRequest> ValidateAndExtractLines(List<CreateGeneralJournalLineRequest> lines)
    {
        // Seluruh aturan jurnal berada di AumoBackend.Domain.JournalEntry; di sini hanya dipanggil.
        var entry = JournalEntry.Create(
            lines.Select(l => new JournalLine(l.AccountId, l.LineDescription, l.Debit, l.Credit)));

        return entry.Lines
            .Select(l => new CreateGeneralJournalLineRequest
            {
                AccountId = l.AccountId,
                LineDescription = l.Description,
                Debit = l.Debit,
                Credit = l.Credit,
            })
            .ToList();
    }

    private async Task ValidateAccountsAsync(Guid userId, List<CreateGeneralJournalLineRequest> lines)
    {
        var validAccountIds = (await this.db.ChartOfAccounts
            .Where(a => a.IsActive && a.UserId == userId)
            .Select(a => a.Id)
            .ToListAsync())
            .ToHashSet();

        if (lines.Any(l => !validAccountIds.Contains(l.AccountId)))
        {
            throw new DomainRuleViolation("One or more selected accounts are invalid or inactive.");
        }
    }
}
