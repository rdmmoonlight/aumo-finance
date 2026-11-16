namespace AumoBackend.Services.Home;

using AumoBackend.DTOs.Home;

public interface IHomeService
{
    Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync();
}
