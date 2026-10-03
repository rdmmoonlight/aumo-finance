using AumoBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace AumoBackend.Controllers
{
    [ApiController]
    [Route("api/v1/market")]
    public class MarketController : ControllerBase
    {
        private readonly ILogger<MarketController> _logger;
        private readonly IMarketDataService _marketDataService;

        public MarketController(ILogger<MarketController> logger, IMarketDataService marketDataService)
        {
            _logger = logger;
            _marketDataService = marketDataService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMarketIndicators()
        {
            try
            {
                var data = await _marketDataService.GetMarketIndicatorsAsync();

                return Ok(new
                {
                    status = "success",
                    data = data
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal mengambil data pasar");
                return StatusCode(500, new
                {
                    status = "error",
                    message = "Terjadi kesalahan saat memuat data pasar"
                });
            }
        }
    }
}