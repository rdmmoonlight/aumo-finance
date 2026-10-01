using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Health
{
    public interface IHealthService
    {
        Task<HealthStatusDto> GetHealthStatusAsync();
    }
}
