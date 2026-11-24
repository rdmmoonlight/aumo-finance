namespace AumoBackend.Test.Integration;

using AumoBackend.Domain;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntry;
using AumoBackend.Services.Periods;
using AumoBackend.Services.Reports.GeneralLedgers;
using AumoBackend.Services.Reports.Journals;
using AumoBackend.Services.Reports.TrialBalances;
using Microsoft.EntityFrameworkCore;

[Collection(PostgresCollection.Name)]
public class ClosePeriodTests(PostgresFixture fixture)
{
    private static PeriodsService Service(AumoBackend.Data.AppDbContext db)
    {
        var posting = TestPosting.For(db);
        var trialBalances = new TrialBalancesService(db);
        var journals = new JournalsService(db, trialBalances, posting, new TransactionNumberService(db));
        return new(db, posting, new GeneralLedgersService(db), trialBalances, journals);
    }

    private static async Task<int> AddAccountAsync(AumoBackend.Data.AppDbContext db, Guid userId, int number, string name, string type, string role)
    {
        var account = new ChartOfAccount { UserId = userId, ReferenceNumber = number, AccountName = name, Type = type, Role = role, IsActive = true };
        db.ChartOfAccounts.Add(account);
        await db.SaveChangesAsync();
        return account.Id;
    }

    private static Task PostAsync(AumoBackend.Data.AppDbContext db, SeededUser u, int debitId, int creditId, decimal amount) =>
        TestPosting.For(db).PostAsync(new PostJournalCommand(
            u.UserId, "General", SeededUser.Utc(2026, 1, 5),
            new[] { new JournalLine(debitId, null, amount, 0m), new JournalLine(creditId, null, 0m, amount) }));

    [Fact]
    public async Task Close_OpenPeriodWithNoEarlierOpenPeriod_Succeeds()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.True(result.Success);
        await using var verify = fixture.CreateDb();
        Assert.True((await verify.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_AlreadyClosedPeriod_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.ClosedPeriodId);

        Assert.False(result.Success);
        Assert.Contains("already closed", result.Message);
    }

    [Fact]
    public async Task Close_UnknownPeriod_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(u.UserId, 987654);

        Assert.False(result.Success);
        Assert.Contains("not found", result.Message);
    }

    [Fact]
    public async Task Close_PeriodOfAnotherUser_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var other = await SeededUser.CreateAsync(db);

        var result = await Service(db).ClosePeriodAsync(other.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.False((await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_WhileEarlierPeriodIsStillOpen_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        // Buka kembali Desember 2025 sehingga Januari 2026 tidak boleh ditutup lebih dulu.
        (await db.Periods.SingleAsync(p => p.Id == u.ClosedPeriodId)).IsClosed = false;
        await db.SaveChangesAsync();

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.Contains("earlier period", result.Message);
        Assert.False((await db.Periods.AsNoTracking().SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_ThenCreatingJournalInThatPeriod_IsRejected()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        var entryService = new JournalEntryService(db, new TransactionNumberService(db), TestPosting.For(db));
        await Assert.ThrowsAsync<DomainRuleViolation>(() => entryService.CreateAsync(u.UserId, new AumoBackend.DTOs.Reports.CreateGeneralJournalRequest
        {
            EntryDate = SeededUser.Utc(2026, 1, 10),
            Lines = new()
            {
                new() { AccountId = u.CashId, Debit = 10m },
                new() { AccountId = u.EquityId, Credit = 10m },
            },
        }));
    }

    [Fact]
    public async Task Close_UnbalancedTrialBalance_FailsAndKeepsPeriodOpen()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        await PostAsync(db, u, u.CashId, u.EquityId, 100m);

        // Akun nonaktif keluar dari neraca saldo, sehingga debit dan kredit tidak lagi sama.
        (await db.ChartOfAccounts.SingleAsync(a => a.Id == u.EquityId)).IsActive = false;
        await db.SaveChangesAsync();

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.Contains("not balanced", result.Message);
        await using var verify = fixture.CreateDb();
        Assert.False((await verify.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
        Assert.False(await verify.PostClosingTrialBalance.AnyAsync(x => x.UserId == u.UserId));
    }

    [Fact]
    public async Task Close_NetIncomeWithoutRetainedEarningsAccount_FailsAndKeepsPeriodOpen()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        int revenueId = await AddAccountAsync(db, u.UserId, 401, "Pendapatan", "OperatingIncome", "Default");
        await PostAsync(db, u, u.CashId, revenueId, 100m);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.False(result.Success);
        Assert.Contains("Retained Earnings", result.Message);
        await using var verify = fixture.CreateDb();
        Assert.False((await verify.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);
    }

    [Fact]
    public async Task Close_WithNetIncome_ClosesAndSavesBalancedPostClosingSnapshot()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        int revenueId = await AddAccountAsync(db, u.UserId, 401, "Pendapatan", "OperatingIncome", "Default");
        await AddAccountAsync(db, u.UserId, 302, "Laba Ditahan", "Equity", "RetainedEarnings");
        await PostAsync(db, u, u.CashId, revenueId, 100m);

        var result = await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId);

        Assert.True(result.Success, result.Message);
        await using var verify = fixture.CreateDb();
        Assert.True((await verify.Periods.SingleAsync(p => p.Id == u.OpenPeriodId)).IsClosed);

        var snapshot = await verify.PostClosingTrialBalance
            .Where(x => x.UserId == u.UserId && x.PeriodId == u.OpenPeriodId)
            .ToListAsync();
        var total = snapshot.Single(x => x.IsTotalRow);
        Assert.Equal(100m, total.DebitBalance);
        Assert.Equal(100m, total.CreditBalance);
        Assert.Contains(snapshot, x => x.AccountName == "Laba Ditahan" && x.CreditBalance == 100m);
    }

    [Fact]
    public async Task Close_Twice_SecondAttemptFails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);

        Assert.True((await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId)).Success);
        Assert.False((await Service(db).ClosePeriodAsync(u.UserId, u.OpenPeriodId)).Success);
    }
}
