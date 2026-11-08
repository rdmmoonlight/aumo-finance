namespace AumoBackend.Services.Dashboard;

using AumoBackend.DTOs;

public interface IDashboardService
{
    Task<DashboardDataDto> GetDashboardDataAsync(Guid userId, string period);
}
