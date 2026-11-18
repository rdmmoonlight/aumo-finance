namespace AumoBackend.Services.Periods;

using AumoBackend.DTOs;
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

        if (entity.IsClosed)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = $"Period {entity.PeriodName} is already closed.",
            };
        }

        var hasEarlierOpenPeriod = await this.db.Periods
            .AnyAsync(p => p.UserId == userId && p.Id != entity.Id && p.StartDate < entity.StartDate && !p.IsClosed);

        if (hasEarlierOpenPeriod)
        {
            return new BaseServiceResult
            {
                Success = false,
                Message = $"Cannot close {entity.PeriodName}: an earlier period is still open. Close earlier periods first.",
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
}
