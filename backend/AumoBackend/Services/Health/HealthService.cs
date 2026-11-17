namespace AumoBackend.Services.Health;

using AumoBackend.Data;
using AumoBackend.DTOs;

public class HealthService : IHealthService
{
    private readonly AppDbContext context;

    public HealthService(AppDbContext context)
    {
        this.context = context;
    }

    public Task<HealthStatusDto> GetHealthStatusAsync()
    {
        return Task.FromResult(new HealthStatusDto
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
        });
    }

    public Task<bool> CanConnectToDatabaseAsync()
    {
        return this.context.Database.CanConnectAsync();
    }
}
