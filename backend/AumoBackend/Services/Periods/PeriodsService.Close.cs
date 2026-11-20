namespace AumoBackend.Services.Periods;

using AumoBackend.Domain;
using AumoBackend.DTOs;
using AumoBackend.Models;
using Microsoft.EntityFrameworkCore;

public partial class PeriodsService
{
    public async Task<BaseServiceResult> ClosePeriodAsync(Guid userId, int periodId)
    {
        var entity = await this.db.Periods.FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);
        if (entity == null)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = "Accounting period not found.",
            };
        }

        var periods = await this.db.Periods
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToListAsync();

        try
        {
            PeriodRules.EnsureCanClose(ToRange(entity), periods.Select(ToRange));
        }
        catch (InvalidOperationException ex)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = ex.Message,
            };
        }

        entity.IsClosed = true;
        await this.db.SaveChangesAsync();

        return new BaseServiceResult
        {
            Success = true,
            Message = $"Period {entity.PeriodName} has been closed. Transactions in this period are now locked.",
        };
    }

    private static PeriodRange ToRange(Period p) => new(p.Id, p.PeriodName, p.StartDate, p.EndDate, p.IsClosed);
}
