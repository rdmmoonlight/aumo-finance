using AumoBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services
{
    public interface IMarketDataService
    {
        Task<IEnumerable<MarketIndicatorDto>> GetMarketIndicatorsAsync();
    }
}