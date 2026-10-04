using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Reports.GeneralLedgers;
using AumoBackend.Data;
using AumoBackend.DTOs;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using AumoBackend.Models;

namespace AumoBackend.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IDataProtectionKeyContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Data Protection Keys Table
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;

    // Notifications
    public DbSet<Notification> Notifications => Set<Notification>();

    // Accounting Core
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>();

    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();

    public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();

    public DbSet<TransactionCounter> TransactionCounters => Set<TransactionCounter>();

    public DbSet<Period> Periods => Set<Period>();

    // General Ledger Readonly Staging Tables (Pluralized Class Names)
    public DbSet<PermanentAccountGeneralLedger> PermanentAccountsGeneralLedger => Set<PermanentAccountGeneralLedger>();

    public DbSet<TemporaryAccountGeneralLedger> TemporaryAccountsGeneralLedger => Set<TemporaryAccountGeneralLedger>();

    // Economic Document Repository
    public DbSet<EconomicDocument> EconomicDocuments => Set<EconomicDocument>();

    // Struktur folder untuk Document Repository
    public DbSet<Folder> Folders => Set<Folder>();

    // Guardian
    public DbSet<UserSession> UserSessions => Set<UserSession>();

    public DbSet<LoginActivity> LoginActivities => Set<LoginActivity>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Notifications Configuration
        builder.Entity<Notification>(entity =>
        {
            // Composite Index untuk query cepat per user berdasarkan status baca & urutan waktu
            entity.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ChartOfAccount>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.ReferenceNumber })
                .IsUnique();
        });

        builder.Entity<JournalEntry>(entity =>
        {
            entity.HasMany(x => x.Lines)
                .WithOne(x => x.JournalEntry)
                .HasForeignKey(x => x.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.UserId, x.TransactionNumber })
                .IsUnique();
        });

        builder.Entity<TransactionCounter>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.CounterKey })
                .IsUnique();
        });

        builder.Entity<JournalEntryLine>(entity =>
        {
            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Permanent Accounts General Ledger Configuration
        builder.Entity<PermanentAccountsGeneralLedger>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.PeriodId, x.AccountId });

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

        // Temporary Accounts General Ledger Configuration
        builder.Entity<TemporaryAccountsGeneralLedger>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.PeriodId, x.AccountId });

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

        // Document Repository Indexing
        builder.Entity<EconomicDocument>(entity =>
        {
            entity.HasIndex(x => x.Category);
            entity.HasIndex(x => x.ReferenceNumber);
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.FolderId);

            entity.HasOne(x => x.Folder)
                .WithMany()
                .HasForeignKey(x => x.FolderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Folder (struktur direktori Document Repository)
        builder.Entity<Folder>(entity =>
        {
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.ParentFolderId);

            entity.HasOne(x => x.ParentFolder)
                .WithMany()
                .HasForeignKey(x => x.ParentFolderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Guardian Session
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

        // Guardian Activity
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
/// Factory khusus untuk EF Core Tooling pada Design-Time (CLI Migrations)
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? "Host=localhost;Database=aumo_db;Username=postgres;Password=postgres";

        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
