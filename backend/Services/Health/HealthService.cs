using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Health
{
    public class HealthService : IHealthService
    {
        public Task<HealthStatusDto> GetHealthStatusAsync()
        {
            return Task.FromResult(new HealthStatusDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
