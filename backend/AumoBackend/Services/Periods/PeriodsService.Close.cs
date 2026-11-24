namespace AumoBackend.Services.Periods;

using AumoBackend.Domain;
using AumoBackend.DTOs;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

public partial class PeriodsService
{
    private const string AdjustedReport = "adjusted";
    private const string PostClosingReport = "post-closing";
    private const string RetainedEarningsRole = "RetainedEarnings";

    /// <summary>
    /// Menutup periode. Syarat (lihat <see cref="PeriodRules"/>): tidak ada periode lebih awal yang terbuka,
    /// neraca saldo setelah penyesuaian seimbang, dan laba/rugi bersih punya akun Retained Earnings aktif.
    /// Saat ditutup, jurnal penutup dibuat dan diperiksa seimbang, lalu neraca saldo pasca-penutupan disimpan.
    /// Semuanya dalam satu transaksi: bila satu langkah gagal, periode tetap terbuka.
    /// </summary>
    public async Task<BaseServiceResult> ClosePeriodAsync(Guid userId, int periodId)
    {
        var strategy = this.db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            this.db.ChangeTracker.Clear();
            await using var transaction = await this.db.Database.BeginTransactionAsync();

            var entity = await this.db.Periods.FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);
            if (entity == null)
            {
                return CloseFailed("Accounting period not found.");
            }

            var periods = await this.db.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .ToListAsync();

            try
            {
                PeriodRules.EnsureCanClose(ToRange(entity), periods.Select(ToRange));
                await this.EnsureReadyToCloseAsync(userId, entity);

                // Status tertutup baru diset di memori: pembentukan jurnal penutup dan neraca saldo
                // pasca-penutupan hanya berjalan untuk periode yang berstatus tertutup.
                entity.IsClosed = true;
                await this.GenerateClosingAsync(userId, entity);
            }
            catch (DomainRuleViolation ex)
            {
                this.db.ChangeTracker.Clear();
                return CloseFailed(ex.Message);
            }

            await this.db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new BaseServiceResult
            {
                Success = true,
                Message = $"Period {entity.PeriodName} has been closed. Transactions in this period are now locked.",
            };
        });
    }

    private static BaseServiceResult CloseFailed(string message) => new() { Success = false, Message = message };

    private static PeriodRange ToRange(Period p) => new(p.Id, p.PeriodName, p.StartDate, p.EndDate, p.IsClosed);

    /// <summary>Neraca saldo setelah penyesuaian wajib seimbang; laba/rugi bersih wajib punya akun Retained Earnings aktif.</summary>
    private async Task EnsureReadyToCloseAsync(Guid userId, Period period)
    {
        var rows = await this.trialBalances.BuildTrialBalancesRowsAsync(userId, period, true, AdjustedReport);
        PeriodRules.EnsureTrialBalanceBalanced(period.PeriodName, rows.Sum(r => r.Debit), rows.Sum(r => r.Credit));

        decimal netIncome = PeriodRules.NetIncome(rows.Select(r => ((string?)r.Type, r.NetBalance)));
        bool hasRetainedEarnings = await this.db.ChartOfAccounts
            .AnyAsync(a => a.UserId == userId && a.IsActive && a.Role == RetainedEarningsRole);

        PeriodRules.EnsureCanReceiveNetIncome(period.PeriodName, netIncome, hasRetainedEarnings);
    }

    /// <summary>
    /// Membuat jurnal penutup dan memeriksa setiap kelompoknya seimbang, lalu menyimpan neraca saldo pasca-penutupan
    /// (yang juga wajib seimbang). Jurnal penutup tidak ditulis ke GeneralJournals: semua laporan menghitungnya
    /// dari jurnal periode, sehingga menyimpannya akan membuat dua sumber angka.
    /// </summary>
    private async Task GenerateClosingAsync(Guid userId, Period period)
    {
        var groups = await this.journals.BuildClosingJournalGroupsAsync(userId, period);
        foreach (var group in groups)
        {
            PeriodRules.EnsureClosingGroupBalanced(period.PeriodName, group.Description, group.TotalDebit, group.TotalCredit);
        }

        var postClosing = await this.trialBalances.BuildTrialBalancesRowsAsync(userId, period, true, PostClosingReport);
        PeriodRules.EnsureTrialBalanceBalanced(
            period.PeriodName,
            postClosing.Sum(r => r.Debit),
            postClosing.Sum(r => r.Credit),
            "post-closing trial balance");

        await this.trialBalances.SaveSnapshotAsync(PostClosingReport, userId, period, postClosing);
    }
}
