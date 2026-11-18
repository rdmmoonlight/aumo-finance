namespace AumoBackend.Models;

public static class PeriodLock
{
    public static bool IsDateLocked(DateTime date, IEnumerable<Period>? periods)
    {
        if (periods is null)
        {
            return false;
        }

        return periods.Any(p => p is { IsClosed: true } && date >= p.StartDate && date <= p.EndDate);
    }
}
