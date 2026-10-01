using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardDataDto> GetDashboardDataAsync(Guid userId, string period);
}
