namespace AumoBackend.Services.Health
{
    using AumoBackend.DTOs;

    public class HealthService : IHealthService
    {
        public Task<HealthStatusDto> GetHealthStatusAsync()
        {
            return Task.FromResult(new HealthStatusDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
            });
        }
    }
}
