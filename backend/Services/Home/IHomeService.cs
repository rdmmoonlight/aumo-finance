using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Home;

public interface IHomeService
{
    Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync();
}
