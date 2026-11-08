namespace AumoBackend.Test.Integration;

using AumoBackend.Data;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

/// <summary>Satu container PostgreSQL untuk seluruh tes integrasi. Setiap tes memakai UserId baru sehingga datanya terisolasi.</summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    public async Task InitializeAsync()
    {
        await this.container.StartAsync();
        await using var db = this.CreateDb();
        await db.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync() => await this.container.DisposeAsync();

    public AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(this.container.GetConnectionString())
            .Options;
        return new AppDbContext(options);
    }
}

[CollectionDefinition(Name)]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture>
{
    public const string Name = "postgres";
}

/// <summary>Data dasar per pengguna: 2 akun, periode Januari 2026 (terbuka, terpilih) dan Desember 2025 (tertutup).</summary>
public sealed class SeededUser
{
    public Guid UserId { get; } = Guid.NewGuid();

    public int CashId { get; private set; }

    public int EquityId { get; private set; }

    public int OpenPeriodId { get; private set; }

    public int ClosedPeriodId { get; private set; }

    public static DateTime Utc(int year, int month, int day) => new(year, month, day, 0, 0, 0, DateTimeKind.Utc);

    public static async Task<SeededUser> CreateAsync(AppDbContext db)
    {
        var user = new SeededUser();

        var cash = new ChartOfAccount { UserId = user.UserId, ReferenceNumber = 101, AccountName = "Kas", Type = "Assets", Role = "Default", IsActive = true };
        var equity = new ChartOfAccount { UserId = user.UserId, ReferenceNumber = 301, AccountName = "Modal", Type = "Equity", Role = "Default", IsActive = true };
        db.ChartOfAccounts.AddRange(cash, equity);

        var open = new Period { UserId = user.UserId, PeriodName = "Januari 2026", StartDate = Utc(2026, 1, 1), EndDate = Utc(2026, 1, 31), IsClosed = false, IsSelected = true };
        var closed = new Period { UserId = user.UserId, PeriodName = "Desember 2025", StartDate = Utc(2025, 12, 1), EndDate = Utc(2025, 12, 31), IsClosed = true, IsSelected = false };
        db.Periods.AddRange(open, closed);

        await db.SaveChangesAsync();

        user.CashId = cash.Id;
        user.EquityId = equity.Id;
        user.OpenPeriodId = open.Id;
        user.ClosedPeriodId = closed.Id;
        return user;
    }
}
