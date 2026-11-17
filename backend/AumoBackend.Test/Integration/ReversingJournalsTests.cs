namespace AumoBackend.Test.Integration;

using AumoBackend.Data;
using AumoBackend.DTOs.Reports;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.Journals;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.EntityFrameworkCore;

[Collection(PostgresCollection.Name)]
public class ReversingJournalsTests(PostgresFixture fixture)
{
    private static JournalsService CreateService(AppDbContext db) =>
        new(db, new TransactionNumberService(db));

    private static async Task<(int ExpenseId, int LiabilityId)> SeedAccrualAccountsAsync(AppDbContext db, Guid userId)
    {
        var expense = new ChartOfAccount
        {
            UserId = userId,
            ReferenceNumber = 501,
            AccountName = "Beban Gaji",
            Type = "Expenses",
            Role = "Default",
            IsActive = true,
        };
        var liability = new ChartOfAccount
        {
            UserId = userId,
            ReferenceNumber = 201,
            AccountName = "Utang Gaji",
            Type = "Liabilities",
            Role = "Default",
            IsActive = true,
        };

        db.ChartOfAccounts.AddRange(expense, liability);
        await db.SaveChangesAsync();
        return (expense.Id, liability.Id);
    }

    private static async Task<int> SeedAdjustingEntryAsync(
        AppDbContext db,
        Guid userId,
        DateTime entryDate,
        int debitAccountId,
        int creditAccountId,
        decimal amount)
    {
        int journalEntryId = await GeneralJournalWriter.NextJournalEntryIdAsync(db);
        var rows = GeneralJournalWriter.BuildRows(
            journalEntryId,
            userId,
            $"ADJ-{journalEntryId:D4}",
            "Adjusting",
            entryDate,
            DateTime.UtcNow,
            null,
            new[]
            {
                new GeneralJournalWriter.Line(debitAccountId, "Penyesuaian gaji akhir periode", amount, 0m),
                new GeneralJournalWriter.Line(creditAccountId, "Akrual utang gaji", 0m, amount),
            });

        db.GeneralJournals.AddRange(rows);
        await db.SaveChangesAsync();
        return journalEntryId;
    }

    private static bool MatchesAccount(TrialBalancesRow row, ChartOfAccount account)
    {
        if (row.IsTotalRow)
            return false;

        string refStr = account.ReferenceNumber.ToString();
        return row.AccountNumber == refStr
            || row.ReferenceNumber == refStr
            || string.Equals(row.AccountName, account.AccountName, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateReversing_ValidAdjustingEntry_SucceedsAndSwapsDebitCredit()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var (expenseId, liabilityId) = await SeedAccrualAccountsAsync(db, u.UserId);

        var openPeriod = await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId);
        var previousPeriodEnd = openPeriod.StartDate.AddDays(-1);

        int adjustingId = await SeedAdjustingEntryAsync(
            db,
            u.UserId,
            previousPeriodEnd,
            debitAccountId: expenseId,
            creditAccountId: liabilityId,
            amount: 1_500_000m);

        var result = await CreateService(db).CreateReversingAsync(u.UserId, new CreateReversingRequest
        {
            AdjustingEntryIds = [adjustingId],
        });

        var reversing = Assert.Single(result);
        Assert.Equal("Reversing", reversing.JournalType);
        Assert.Equal(openPeriod.StartDate.Date, reversing.EntryDate.Date);
        Assert.Equal(GeneralJournalWriter.PostedStatus, reversing.Status);
        Assert.Equal(2, reversing.Lines.Count);

        // Semula Beban Gaji Debit 1.500.000 -> tertukar menjadi Credit 1.500.000
        var expenseLine = reversing.Lines.Single(l => l.AccountId == expenseId);
        Assert.Equal(0m, expenseLine.Debit);
        Assert.Equal(1_500_000m, expenseLine.Credit);

        // Semula Utang Gaji Credit 1.500.000 -> tertukar menjadi Debit 1.500.000
        var liabilityLine = reversing.Lines.Single(l => l.AccountId == liabilityId);
        Assert.Equal(1_500_000m, liabilityLine.Debit);
        Assert.Equal(0m, liabilityLine.Credit);

        // Pastikan tersimpan di PostgreSQL dan terhubung ke jurnal sumber
        await using var verify = fixture.CreateDb();
        var savedRows = await verify.GeneralJournals
            .AsNoTracking()
            .Where(g => g.UserId == u.UserId && g.JournalType == "Reversing")
            .ToListAsync();

        Assert.Equal(2, savedRows.Count);
        Assert.All(savedRows, r => Assert.Equal(adjustingId, r.SourceJournalEntryId));
    }

    [Fact]
    public async Task CreateReversing_DuplicateReversal_ThrowsInvalidOperationException()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var (expenseId, liabilityId) = await SeedAccrualAccountsAsync(db, u.UserId);

        var openPeriod = await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId);
        var previousPeriodEnd = openPeriod.StartDate.AddDays(-1);

        int adjustingId = await SeedAdjustingEntryAsync(
            db,
            u.UserId,
            previousPeriodEnd,
            expenseId,
            liabilityId,
            750_000m);

        var service = CreateService(db);
        var request = new CreateReversingRequest { AdjustingEntryIds = [adjustingId] };

        // Pembalikan pertama berhasil
        await service.CreateReversingAsync(u.UserId, request);

        // Pembalikan kedua untuk sumber yang sama wajib ditolak
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateReversingAsync(u.UserId, request));
        Assert.Contains("sudah pernah dibalik", ex.Message);

        await using var verify = fixture.CreateDb();
        int reversingEntryCount = await verify.GeneralJournals
            .AsNoTracking()
            .Where(g => g.UserId == u.UserId && g.JournalType == "Reversing")
            .Select(g => g.JournalEntryId)
            .Distinct()
            .CountAsync();

        Assert.Equal(1, reversingEntryCount);
    }

    [Fact]
    public async Task CreateReversing_WhenSelectedPeriodIsClosed_ThrowsInvalidOperationException()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var (expenseId, liabilityId) = await SeedAccrualAccountsAsync(db, u.UserId);

        var openPeriod = await db.Periods.SingleAsync(p => p.Id == u.OpenPeriodId);
        var previousPeriodEnd = openPeriod.StartDate.AddDays(-1);

        int adjustingId = await SeedAdjustingEntryAsync(
            db,
            u.UserId,
            previousPeriodEnd,
            expenseId,
            liabilityId,
            500_000m);

        // Tutup periode terpilih
        openPeriod.IsClosed = true;
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateService(db).CreateReversingAsync(u.UserId, new CreateReversingRequest
            {
                AdjustingEntryIds = [adjustingId],
            }));

        Assert.Contains("sudah ditutup", ex.Message);

        await using var verify = fixture.CreateDb();
        bool anyReversingCreated = await verify.GeneralJournals
            .AsNoTracking()
            .AnyAsync(g => g.UserId == u.UserId && g.JournalType == "Reversing");

        Assert.False(anyReversingCreated);
    }

    [Fact]
    public async Task CreateReversing_NewPeriodTrialBalance_ReflectsReversedAccrualCorrectly()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var (expenseId, liabilityId) = await SeedAccrualAccountsAsync(db, u.UserId);

        var accountsById = await db.ChartOfAccounts
            .AsNoTracking()
            .Where(a => a.Id == expenseId || a.Id == liabilityId)
            .ToDictionaryAsync(a => a.Id);

        var expenseAccount = accountsById[expenseId];
        var liabilityAccount = accountsById[liabilityId];

        var newPeriod = await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId);
        var previousPeriodEnd = newPeriod.StartDate.AddDays(-1);
        var previousPeriodMid = previousPeriodEnd.AddDays(-15);

        // 1. Transaksi modal awal pada periode sebelumnya (di luar rentang tanggal newPeriod)
        int initialEntryId = await GeneralJournalWriter.NextJournalEntryIdAsync(db);
        db.GeneralJournals.AddRange(GeneralJournalWriter.BuildRows(
            initialEntryId,
            u.UserId,
            $"JU-{initialEntryId:D4}",
            "General",
            previousPeriodMid,
            DateTime.UtcNow,
            null,
            new[]
            {
                new GeneralJournalWriter.Line(u.CashId, "Setoran modal awal", 5_000_000m, 0m),
                new GeneralJournalWriter.Line(u.EquityId, "Modal pemilik", 0m, 5_000_000m),
            }));
        await db.SaveChangesAsync();

        // 2. Jurnal penyesuaian akrual gaji akhir periode sebelumnya
        int adjustingId = await SeedAdjustingEntryAsync(
            db,
            u.UserId,
            previousPeriodEnd,
            debitAccountId: expenseId,
            creditAccountId: liabilityId,
            amount: 1_500_000m);

        // 3. Jalankan jurnal pembalik pada awal periode baru
        await CreateService(db).CreateReversingAsync(u.UserId, new CreateReversingRequest
        {
            AdjustingEntryIds = [adjustingId],
        });

        // 4. Hitung Unadjusted Trial Balance untuk periode baru
        var trialBalanceService = new TrialBalancesService(db);
        var rows = await trialBalanceService.BuildUnadjustedTrialBalanceAsync(u.UserId, newPeriod);

        // Utang Gaji di periode baru bersaldo Debit 1.500.000 dari jurnal pembalik
        var liabilityRow = Assert.Single(rows, r => MatchesAccount(r, liabilityAccount));
        Assert.Equal(1_500_000m, liabilityRow.DebitBalance);
        Assert.Equal(0m, liabilityRow.CreditBalance);

        // Beban Gaji di periode baru bersaldo Credit 1.500.000 akibat jurnal pembalik
        var expenseRow = Assert.Single(rows, r => MatchesAccount(r, expenseAccount));
        Assert.Equal(0m, expenseRow.DebitBalance);
        Assert.Equal(1_500_000m, expenseRow.CreditBalance);

        // Baris Total dan jumlah seluruh baris akun harus seimbang
        var accountRows = rows.Where(r => !r.IsTotalRow).ToList();
        Assert.Equal(2, accountRows.Count);
        Assert.Equal(accountRows.Sum(r => r.DebitBalance), accountRows.Sum(r => r.CreditBalance));

        var totalRow = Assert.Single(rows, r => r.IsTotalRow);
        Assert.Equal(1_500_000m, totalRow.DebitBalance);
        Assert.Equal(1_500_000m, totalRow.CreditBalance);
    }
}
