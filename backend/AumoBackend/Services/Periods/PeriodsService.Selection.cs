namespace AumoBackend.Services.Periods;

using System.Globalization;
using AumoBackend.Data;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.JournalEntries;
using AumoBackend.Services.Reports.GeneralLedgers;
using Microsoft.EntityFrameworkCore;

public partial class PeriodsService
{
    public async Task<SelectPeriodResult?> SelectPeriodAsync(Guid userId, int periodId)
    {
        var entity = await this.db.Periods.FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);
        if (entity == null)
        {
            return null; // Return null untuk mencocokkan Task<SelectPeriodResult?> di IPeriodsService & sinyal NotFound di controller
        }

        await this.db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        await this.db.Periods
            .Where(p => p.Id == periodId && p.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, true));

        await SelectedPeriodHelper.SelectPeriodAsync(this.db, userId, entity.Id);

        // Periode tertutup yang tidak terpilih dibersihkan dari tabel sumber oleh archiver.
        // IsSelected sudah true di atas (archiver melewati periode terpilih), lalu baris
        // periode ini dipulihkan dari arsip SEBELUM General Ledger dihitung ulang.
        if (entity.IsClosed)
        {
            await this.RestorePeriodRowsAsync(userId, entity);
        }

        await this.glService.RefreshGeneralLedgersAsync(userId);

        return new SelectPeriodResult
        {
            Success = true,
            SelectedPeriodId = entity.Id,
            Message = $"Now viewing {entity.PeriodName}" + (entity.IsClosed ? " (Closed)." : "."),
        };
    }

    // Daftar kolom harus sama dengan entity GeneralJournal (urutan bebas, nama = kolom tabel).
    private const string GeneralJournalColumns =
        "\"LineId\", \"AccountId\", \"LineDescription\", \"Debit\", \"Credit\", \"LineOrder\", "
        + "\"JournalEntryId\", \"JournalType\", \"EntryDate\", \"TransactionNumber\", \"UserId\", "
        + "\"Status\", \"CreatedAt\", \"UpdatedAt\"";

    private const string GeneralJournalSyncLockSql =
        "SELECT pg_advisory_xact_lock(hashtext('aumo_generaljournal_sync'))";

    private const string RestoreGeneralJournalSql =
        "INSERT INTO \"public\".\"GeneralJournal\" (" + GeneralJournalColumns + ") "
        + "SELECT " + GeneralJournalColumns + " FROM \"archive\".\"GeneralJournal\" "
        + "WHERE \"UserId\" = {0} AND \"EntryDate\" >= {1} AND \"EntryDate\" < {2} "
        + "ON CONFLICT DO NOTHING";

    // Menyalin baris jurnal satu periode dari arsip ke tabel sumber. Aman dipanggil berulang:
    // baris yang sudah ada dilewati (ON CONFLICT DO NOTHING). Rentang tanggal sama dengan
    // yang dipakai archiver (>= StartDate dan < EndDate + 1 hari).
    private async Task RestorePeriodRowsAsync(Guid userId, Period period)
    {
        var archiveExists = await this.db.Database
            .SqlQuery<bool>($"SELECT to_regclass('archive.\"GeneralJournal\"') IS NOT NULL AS \"Value\"")
            .SingleAsync();

        // Arsip belum dibuat berarti belum ada yang diarsipkan; semua baris masih di tabel sumber.
        if (!archiveExists)
        {
            return;
        }

        var start = DateTime.SpecifyKind(period.StartDate.Date, DateTimeKind.Utc);
        var endExclusive = DateTime.SpecifyKind(period.EndDate.Date.AddDays(1), DateTimeKind.Utc);

        // Advisory lock yang sama dengan archiver (purgeArchivedClosedPeriods). IsSelected sudah
        // tersimpan sebelum method ini dipanggil, jadi purge yang berjalan setelah lock dilepas
        // akan melewati periode ini; purge yang sudah berjalan lebih dulu selesai sebelum pemulihan.
        var strategy = this.db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await this.db.Database.BeginTransactionAsync();
            await this.db.Database.ExecuteSqlRawAsync(GeneralJournalSyncLockSql);
            await this.db.Database.ExecuteSqlRawAsync(RestoreGeneralJournalSql, userId, start, endExclusive);
            await tx.CommitAsync();
        });
    }

    public async Task<BaseServiceResult> ClearSelectionAsync(Guid userId)
    {
        await this.glService.ClearSelectedPeriodLedgersAsync(userId);

        await this.db.Periods
            .Where(p => p.UserId == userId && p.IsSelected)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsSelected, false));

        await SelectedPeriodHelper.ClearSelectionAsync(this.db, userId);

        return new BaseServiceResult
        {
            Success = true,
            Message = "Period selection cleared.",
        };
    }
}
