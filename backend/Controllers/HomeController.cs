using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace AumoBackend.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IMarketDataService _marketDataService;

        public HomeController(
            ILogger<HomeController> logger, 
            IMarketDataService marketDataService)
        {
            _logger = logger;
            _marketDataService = marketDataService;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [HttpGet("api/v1/market")]
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
