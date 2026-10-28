using Microsoft.EntityFrameworkCore;

namespace AumoBackend.Models;

public partial class NeondbContext : DbContext
{
    public NeondbContext()
    {
    }

    public NeondbContext(DbContextOptions<NeondbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TrialBalanceAdjusted> TrialBalanceAdjusteds { get; set; } = null!;

    public virtual DbSet<TrialBalancePostClosing> TrialBalancePostClosings { get; set; } = null!;

    public virtual DbSet<TrialBalanceUnadjusted> TrialBalanceUnadjusteds { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=ep-wandering-bread-ao1sazxn.c-2.ap-southeast-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_SIwmzB1AdMk4;SSL Mode=Require;Trust Server Certificate=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("postgres_fdw");

        modelBuilder.Entity<TrialBalanceAdjusted>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TrialBalanceAdjusted_pkey");

            entity.ToTable("TrialBalanceAdjusted");

            entity.Property(e => e.Id).UseIdentityAlwaysColumn();
            entity.Property(e => e.AccountName).HasMaxLength(255);
            entity.Property(e => e.AccountNumber).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.CreditBalance).HasPrecision(15, 2);
            entity.Property(e => e.DebitBalance).HasPrecision(15, 2);
            entity.Property(e => e.IsTotalRow).HasDefaultValue(false);
        });

        modelBuilder.Entity<TrialBalancePostClosing>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TrialBalancePostClosing_pkey");

            entity.ToTable("TrialBalancePostClosing");

            entity.Property(e => e.Id).UseIdentityAlwaysColumn();
            entity.Property(e => e.AccountName).HasMaxLength(255);
            entity.Property(e => e.AccountNumber).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.CreditBalance).HasPrecision(15, 2);
            entity.Property(e => e.DebitBalance).HasPrecision(15, 2);
            entity.Property(e => e.IsTotalRow).HasDefaultValue(false);
        });

        modelBuilder.Entity<TrialBalanceUnadjusted>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TrialBalanceUnadjusted_pkey");

            entity.ToTable("TrialBalanceUnadjusted");

            entity.Property(e => e.Id).UseIdentityAlwaysColumn();
            entity.Property(e => e.AccountName).HasMaxLength(255);
            entity.Property(e => e.AccountNumber).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.CreditBalance).HasPrecision(15, 2);
            entity.Property(e => e.DebitBalance).HasPrecision(15, 2);
            entity.Property(e => e.IsTotalRow).HasDefaultValue(false);
        });
        modelBuilder.HasSequence<int>("GeneralJournal_JournalEntryId_seq");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
