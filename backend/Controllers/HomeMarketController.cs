using AumoBackend.DTOs;
using AumoBackend.Services.Home;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/api/v1/home")]
[Tags("MarketData")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class HomeMarketController : ControllerBase
{
    private readonly IHomeService _homeService;
    private readonly ILogger<HomeMarketController> _logger;

    public HomeMarketController(IHomeService homeService, ILogger<HomeMarketController> logger)
    {
        _homeService = homeService;
        _logger = logger;
    }

    /// <summary>
    /// Indikator pasar untuk halaman Home: kurs USD/IDR dan IHSG.
    /// GET /api/v1/home/market-indicators
    /// </summary>
    [HttpGet("market-indicators")]
    public async Task<IActionResult> GetMarketIndicators()
    {
        try
        {
            var data = await _homeService.GetMarketIndicatorsAsync();
            return Ok(new ApiResponseDto<List<MarketIndicatorDto>>
            {
                Success = data.Count > 0,
                Data = data,
                Message = data.Count > 0
                    ? "Berhasil mendapatkan indikator pasar."
                    : "Data pasar belum tersedia dari penyedia eksternal."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gagal mengambil indikator pasar untuk halaman Home.");
            return StatusCode(500, new ApiResponseDto<List<MarketIndicatorDto>>
            {
                Success = false,
                Message = "Terjadi kesalahan internal pada server."
            });
        }
    }
}
