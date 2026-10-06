using AumoBackend.DTOs.Home;

namespace AumoBackend.Services
{
    public interface IMarketDataService
    {
        Task<IEnumerable<MarketIndicatorDto>> GetMarketIndicatorsAsync();
    }
}