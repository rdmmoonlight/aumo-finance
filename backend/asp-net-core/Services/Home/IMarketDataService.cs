namespace AumoBackend.Services
{
    using AumoBackend.DTOs.Home;

    public interface IMarketDataService
    {
        Task<IEnumerable<MarketIndicatorDto>> GetMarketIndicatorsAsync();
    }
}
