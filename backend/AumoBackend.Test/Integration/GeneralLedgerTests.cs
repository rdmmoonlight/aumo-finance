namespace AumoBackend.Test.Integration;

using AumoBackend.DTOs.Reports;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.GeneralLedgers;

[Collection(PostgresCollection.Name)]
public class GeneralLedgerTests(PostgresFixture fixture)
{
    private static CreateGeneralJournalRequest Journal(DateTime date, int debitAccount, int creditAccount, decimal amount) => new()
    {
        EntryDate = date,
        Lines = new()
        {
            new() { AccountId = debitAccount, Debit = amount },
            new() { AccountId = creditAccount, Credit = amount },
        },
    };

    [Fact]
    public async Task PermanentLedger_AccumulatesRunningBalanceByNormalSide()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var entries = new JournalEntryService(db, new TransactionNumberService(db));

        // Kas (debit normal): +1000 lalu -300. Modal (kredit normal): +1000 lalu -300.
        await entries.CreateAsync(u.UserId, Journal(SeededUser.Utc(2026, 1, 5), u.CashId, u.EquityId, 1000m));
        await entries.CreateAsync(u.UserId, Journal(SeededUser.Utc(2026, 1, 10), u.EquityId, u.CashId, 300m));

        var result = await new GeneralLedgersService(db).GetPermanentLedgersAsync(u.UserId);

        Assert.True(result.Success);
        Assert.Equal("Januari 2026", result.Data!.SelectedPeriodName);
        Assert.Equal(2, result.Data.Accounts.Count);

        var cash = result.Data.Accounts.Single(a => a.AccountId == u.CashId);
        Assert.True(cash.NormalBalanceIsDebit);
        Assert.Equal(0m, cash.BeginningBalance);
        Assert.Equal(new[] { 1000m, 700m }, cash.Lines.Select(l => l.RunningBalance).ToArray());
        Assert.Equal(700m, cash.EndingBalance);

        var equity = result.Data.Accounts.Single(a => a.AccountId == u.EquityId);
        Assert.False(equity.NormalBalanceIsDebit);
        Assert.Equal(new[] { 1000m, 700m }, equity.Lines.Select(l => l.RunningBalance).ToArray());
        Assert.Equal(700m, equity.EndingBalance);
    }

    [Fact]
    public async Task PermanentLedger_OrdersAccountsByReferenceNumber()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var entries = new JournalEntryService(db, new TransactionNumberService(db));
        await entries.CreateAsync(u.UserId, Journal(SeededUser.Utc(2026, 1, 5), u.CashId, u.EquityId, 100m));

        var result = await new GeneralLedgersService(db).GetPermanentLedgersAsync(u.UserId);

        Assert.Equal(new[] { 101, 301 }, result.Data!.Accounts.Select(a => a.ReferenceNumber).ToArray());
    }

    [Fact]
    public async Task PermanentLedger_ExcludesJournalsOutsideSelectedPeriod()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var entries = new JournalEntryService(db, new TransactionNumberService(db));
        await entries.CreateAsync(u.UserId, Journal(SeededUser.Utc(2026, 1, 5), u.CashId, u.EquityId, 100m));
        // Februari 2026 tidak punya periode, jadi tidak ikut buku besar periode terpilih (Januari).
        await entries.CreateAsync(u.UserId, Journal(SeededUser.Utc(2026, 2, 5), u.CashId, u.EquityId, 900m));

        var result = await new GeneralLedgersService(db).GetPermanentLedgersAsync(u.UserId);

        var cash = result.Data!.Accounts.Single(a => a.AccountId == u.CashId);
        Assert.Single(cash.Lines);
        Assert.Equal(100m, cash.EndingBalance);
    }

    [Fact]
    public async Task PermanentLedger_WithoutSelectedPeriod_Fails()
    {
        await using var db = fixture.CreateDb();
        var u = await SeededUser.CreateAsync(db);
        var open = await db.Periods.FindAsync(u.OpenPeriodId);
        open!.IsSelected = false;
        await db.SaveChangesAsync();

        var result = await new GeneralLedgersService(db).GetPermanentLedgersAsync(u.UserId);

        Assert.False(result.Success);
    }
}
