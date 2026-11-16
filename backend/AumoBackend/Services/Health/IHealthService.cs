namespace AumoBackend.Services.Health
{
    using AumoBackend.DTOs;

    public interface IHealthService
    {
        Task<HealthStatusDto> GetHealthStatusAsync();
    }
}
