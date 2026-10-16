// <copyright file="AppDbContext.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Data;

using AumoBackend.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

// Gunakan type alias eksplisit untuk menyelesaikan ambiguitas
using DataProtectionKeyEntity = Microsoft.AspNetCore.DataProtection.EntityFrameworkCore.DataProtectionKey;

public partial class AppDbContext : DbContext, IDataProtectionKeyContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; } = null!;

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; } = null!;

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; } = null!;

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; } = null!;

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; } = null!;

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; } = null!;

    public virtual DbSet<ChartOfAccount> ChartOfAccounts { get; set; } = null!;

    // Menggunakan type alias agar tidak bentrok dengan AumoBackend.Models.DataProtectionKey
    /// <inheritdoc/>
    public virtual DbSet<DataProtectionKeyEntity> DataProtectionKeys { get; set; } = null!;

    public virtual DbSet<GeneralJournal> GeneralJournals { get; set; } = null!;

    public virtual DbSet<GeneralLedgerPermanentAccount> GeneralLedgerPermanentAccounts { get; set; } = null!;

    public virtual DbSet<GeneralLedgerTemporaryAccount> GeneralLedgerTemporaryAccounts { get; set; } = null!;

    public virtual DbSet<LoginActivity> LoginActivities { get; set; } = null!;

    public virtual DbSet<Notification> Notifications { get; set; } = null!;

    public virtual DbSet<Period> Periods { get; set; } = null!;

    public virtual DbSet<RecoveryCode> RecoveryCodes { get; set; } = null!;

    public virtual DbSet<SecuritySetting> SecuritySettings { get; set; } = null!;

    public virtual DbSet<TransactionCounter> TransactionCounters { get; set; } = null!;

    public virtual DbSet<TrustedDevice> TrustedDevices { get; set; } = null!;

    public virtual DbSet<UserSession> UserSessions { get; set; } = null!;

    /// <inheritdoc/>
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
        }
    }

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims).HasForeignKey(d => d.RoleId);
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

            entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<ChartOfAccount>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_ChartOfAccounts_UserId");

            entity.HasIndex(e => new { e.UserId, e.ReferenceNumber }, "IX_ChartOfAccounts_UserId_ReferenceNumber").IsUnique();

            entity.Property(e => e.AccountName).HasMaxLength(100);
        });

        modelBuilder.Entity<GeneralJournal>(entity =>
        {
            entity.HasKey(e => e.LineId);

            entity.ToTable("GeneralJournal");

            entity.HasIndex(e => e.AccountId, "IX_GeneralJournal_AccountId");

            entity.HasIndex(e => e.JournalEntryId, "IX_GeneralJournal_JournalEntryId");

            entity.HasIndex(e => new { e.UserId, e.EntryDate }, "IX_GeneralJournal_UserId_EntryDate");

            entity.HasIndex(e => new { e.UserId, e.TransactionNumber }, "IX_GeneralJournal_UserId_TransactionNumber");

            entity.Property(e => e.Credit).HasPrecision(18, 2);
            entity.Property(e => e.Debit).HasPrecision(18, 2);
            entity.Property(e => e.JournalType).HasMaxLength(50);
            entity.Property(e => e.LineDescription).HasMaxLength(250);
            entity.Property(e => e.LineOrder).HasDefaultValue(0);
            entity.Property(e => e.TransactionNumber).HasMaxLength(30);

            entity.HasOne(d => d.Account).WithMany(p => p.GeneralJournals)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GeneralLedgerPermanentAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GeneralLedgerPermanentAccounts_pkey");

            entity.HasIndex(e => new { e.UserId, e.PeriodId, e.AccountId, e.EntryDate, e.Id }, "IX_GLPermanent_FetchOrdering");

            entity.HasIndex(e => new { e.UserId, e.PeriodId }, "IX_GLPermanent_UserId_PeriodId");

            entity.HasIndex(e => e.JournalEntryLineId, "IX_GeneralLedgerPermanentAccounts_JournalEntryLineId");

            entity.Property(e => e.Credit).HasPrecision(18, 2);
            entity.Property(e => e.Debit).HasPrecision(18, 2);
            entity.Property(e => e.RunningBalance).HasPrecision(18, 2);
            entity.Property(e => e.TransactionNumber).HasMaxLength(100);

            entity.HasOne(d => d.Account).WithMany(p => p.GeneralLedgerPermanentAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_GLPermanent_ChartOfAccounts");

            entity.HasOne(d => d.JournalEntryLine).WithMany(p => p.GeneralLedgerPermanentAccounts)
                .HasForeignKey(d => d.JournalEntryLineId)
                .HasConstraintName("FK_GLPermanent_GeneralJournal_LineId");

            entity.HasOne(d => d.Period).WithMany(p => p.GeneralLedgerPermanentAccounts)
                .HasForeignKey(d => d.PeriodId)
                .HasConstraintName("FK_GLPermanent_Periods");
        });

        modelBuilder.Entity<GeneralLedgerTemporaryAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GeneralLedgerTemporaryAccounts_pkey");

            entity.HasIndex(e => new { e.UserId, e.PeriodId, e.AccountId, e.EntryDate, e.Id }, "IX_GLTemporary_FetchOrdering");

            entity.HasIndex(e => new { e.UserId, e.PeriodId }, "IX_GLTemporary_UserId_PeriodId");

            entity.HasIndex(e => e.JournalEntryLineId, "IX_GeneralLedgerTemporaryAccounts_JournalEntryLineId");

            entity.Property(e => e.Credit).HasPrecision(18, 2);
            entity.Property(e => e.Debit).HasPrecision(18, 2);
            entity.Property(e => e.RunningBalance).HasPrecision(18, 2);
            entity.Property(e => e.TransactionNumber).HasMaxLength(100);

            entity.HasOne(d => d.Account).WithMany(p => p.GeneralLedgerTemporaryAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_GLTemporary_ChartOfAccounts");

            entity.HasOne(d => d.JournalEntryLine).WithMany(p => p.GeneralLedgerTemporaryAccounts)
                .HasForeignKey(d => d.JournalEntryLineId)
                .HasConstraintName("FK_GLTemporary_GeneralJournal_LineId");

            entity.HasOne(d => d.Period).WithMany(p => p.GeneralLedgerTemporaryAccounts)
                .HasForeignKey(d => d.PeriodId)
                .HasConstraintName("FK_GLTemporary_Periods");
        });

        modelBuilder.Entity<LoginActivity>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.CreatedAt }, "IX_LoginActivities_UserId_CreatedAt");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.LoginActivities).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt }, "IX_Notifications_UserId_IsRead_CreatedAt");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_Periods_IsSelected_Unique")
                .IsUnique()
                .HasFilter("(\"IsSelected\" = true)");

            entity.HasIndex(e => e.UserId, "IX_Periods_UserId");

            entity.Property(e => e.IsClosed).HasDefaultValue(false);
            entity.Property(e => e.IsSelected).HasDefaultValue(false);
            entity.Property(e => e.PeriodName).HasMaxLength(50);
        });

        modelBuilder.Entity<RecoveryCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("RecoveryCodes_pkey");

            entity.HasIndex(e => e.UserId, "IX_RecoveryCodes_UserId");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CodeHash).HasMaxLength(255);
            entity.Property(e => e.Used).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.RecoveryCodes)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_RecoveryCodes_AspNetUsers");
        });

        modelBuilder.Entity<SecuritySetting>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("SecuritySettings_pkey");

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.EmailVerified).HasDefaultValue(false);
            entity.Property(e => e.LoginNotificationEnabled).HasDefaultValue(true);
            entity.Property(e => e.SessionTimeoutMinutes).HasDefaultValue(30);
            entity.Property(e => e.TwoFactorEnabled).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithOne(p => p.SecuritySetting)
                .HasForeignKey<SecuritySetting>(d => d.UserId)
                .HasConstraintName("FK_SecuritySettings_AspNetUsers");
        });

        modelBuilder.Entity<TransactionCounter>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TransactionCounters_pkey");

            entity.HasIndex(e => new { e.UserId, e.CounterKey }, "IX_TransactionCounters_UserId_CounterKey").IsUnique();

            entity.Property(e => e.CounterKey).HasMaxLength(10);
        });

        modelBuilder.Entity<TrustedDevice>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TrustedDevices_pkey");

            entity.HasIndex(e => e.UserId, "IX_TrustedDevices_UserId");

            entity.HasIndex(e => e.DeviceIdentifier, "TrustedDevices_DeviceIdentifier_key").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Browser).HasMaxLength(100);
            entity.Property(e => e.DeviceIdentifier).HasMaxLength(255);
            entity.Property(e => e.DeviceName).HasMaxLength(100);
            entity.Property(e => e.IsTrusted).HasDefaultValue(true);
            entity.Property(e => e.OperatingSystem).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.TrustedDevices)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_TrustedDevices_AspNetUsers");
        });

        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.IsActive }, "IX_UserSessions_UserId_IsActive");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.UserSessions).HasForeignKey(d => d.UserId);
        });
        modelBuilder.HasSequence<int>("GeneralJournal_JournalEntryId_seq");

        this.OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}