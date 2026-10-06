using AumoBackend.DTOs.Home;

namespace AumoBackend.Services.Home;

public interface IHomeService
{
    Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync();
}
