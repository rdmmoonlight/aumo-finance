using AumoBackend.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AumoBackend.Data;

public class AppDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>,
      IDataProtectionKeyContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // ============================================================
    // Data Protection
    // ============================================================

    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;


    // ============================================================
    // Notifications
    // ============================================================

    public DbSet<Notification> Notifications => Set<Notification>();


    // ============================================================
    // Accounting Core
    // ============================================================

    public DbSet<ChartOfAccount> ChartOfAccounts
        => Set<ChartOfAccount>();

    public DbSet<JournalEntry> JournalEntries
        => Set<JournalEntry>();

    public DbSet<JournalEntryLine> JournalEntryLines
        => Set<JournalEntryLine>();

    public DbSet<TransactionCounter> TransactionCounters
        => Set<TransactionCounter>();

    public DbSet<Period> Periods
        => Set<Period>();


    // ============================================================
    // General Ledger
    // ============================================================

    public DbSet<GeneralLedgerPermanentAccounts>
        GeneralLedgerPermanentAccounts
        => Set<GeneralLedgerPermanentAccounts>();

    public DbSet<GeneralLedgerTemporaryAccounts>
        GeneralLedgerTemporaryAccounts
        => Set<GeneralLedgerTemporaryAccounts>();


    // ============================================================
    // Guardian
    // ============================================================

    public DbSet<UserSession> UserSessions
        => Set<UserSession>();

    public DbSet<LoginActivity> LoginActivities
        => Set<LoginActivity>();


    // ============================================================
    // Entity Configuration
    // ============================================================

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);


        // ========================================================
        // Notifications
        // ========================================================

        builder.Entity<Notification>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.IsRead,
                x.CreatedAt
            });

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // Chart of Accounts
        // ========================================================

        builder.Entity<ChartOfAccount>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.ReferenceNumber
            })
            .IsUnique();
        });


        // ========================================================
        // Journal Entry
        // ========================================================

        builder.Entity<JournalEntry>(entity =>
        {
            entity.HasMany(x => x.Lines)
                .WithOne(x => x.JournalEntry)
                .HasForeignKey(x => x.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new
            {
                x.UserId,
                x.TransactionNumber
            })
            .IsUnique();
        });


        // ========================================================
        // Transaction Counter
        // ========================================================

        builder.Entity<TransactionCounter>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.CounterKey
            })
            .IsUnique();
        });


        // ========================================================
        // Journal Entry Line
        // ========================================================

        builder.Entity<JournalEntryLine>(entity =>
        {
            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // ========================================================
        // General Ledger (Permanent Accounts)
        // ========================================================

        builder.Entity<GeneralLedgerPermanentAccounts>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.PeriodId,
                x.AccountId
            });

            entity.HasOne(x => x.Period)
                .WithMany()
                .HasForeignKey(x => x.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.JournalEntry)
                .WithMany()
                .HasForeignKey(x => x.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.JournalEntryLine)
                .WithMany()
                .HasForeignKey(x => x.JournalEntryLineId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // General Ledger (Temporary Accounts)
        // ========================================================

        builder.Entity<GeneralLedgerTemporaryAccounts>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.PeriodId,
                x.AccountId
            });

            entity.HasOne(x => x.Period)
                .WithMany()
                .HasForeignKey(x => x.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.JournalEntry)
                .WithMany()
                .HasForeignKey(x => x.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.JournalEntryLine)
                .WithMany()
                .HasForeignKey(x => x.JournalEntryLineId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // Guardian Session
        // ========================================================

        builder.Entity<UserSession>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.IsActive
            });

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ========================================================
        // Guardian Activity
        // ========================================================

        builder.Entity<LoginActivity>(entity =>
        {
            entity.HasIndex(x => new
            {
                x.UserId,
                x.CreatedAt
            });

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}


/// <summary>
/// Factory khusus untuk EF Core Tooling pada Design-Time
/// (CLI Migrations).
/// </summary>
public class AppDbContextFactory
    : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder =
            new DbContextOptionsBuilder<AppDbContext>();

        var connectionString =
            Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? "Host=localhost;Database=aumo_db;Username=postgres;Password=postgres";

        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
