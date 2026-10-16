#pragma warning disable CA1050
#pragma warning disable CA1848
// <copyright file="HomeController.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

using AumoBackend.DTOs.Home;
using AumoBackend.Services.Home;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Api
{
    [ApiController]
    [Route("")]
    public class MarketDataController : ControllerBase
    {
        private readonly HttpClient httpClient;
        private readonly IConfiguration configuration;
        private readonly ILogger<MarketDataController> logger;

        public MarketDataController(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<MarketDataController> logger)
        {
            this.httpClient = httpClientFactory.CreateClient();
            this.configuration = configuration;
            this.logger = logger;
        }

        /// <summary>
        /// Endpoint untuk mengambil nilai tukar mata uang (Default: USD ke IDR)
        /// GET /kurs?base=USD&target=IDR.
        /// </summary>
        /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
        [HttpGet("kurs")]
        public async Task<IActionResult> GetKurs([FromQuery] string baseCurrency = "USD", [FromQuery] string targetCurrency = "IDR")
        {
            try
            {
                var apiKey = this.configuration["ApiIndonesia:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    this.logger.LogError("API Key untuk ApiIndonesia belum dikonfigurasi.");
                    return this.StatusCode(500, new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Konfigurasi API Key tidak ditemukan.",
                    });
                }

                var requestUrl = $"https://use.apiindonesia.id/kurs/latest?base={baseCurrency}&target={targetCurrency}";

                using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("x-api-key", apiKey);

                var response = await this.httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    this.logger.LogWarning("Gagal mengambil data dari provider eksternal. Status: {StatusCode}", response.StatusCode);
                    return this.StatusCode((int)response.StatusCode, new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Gagal mengambil data nilai tukar dari layanan eksternal.",
                    });
                }

                // Deserialisasi response dari APIIndonesia
                var externalData = await response.Content.ReadFromJsonAsync<ApiIndonesiaKursResponse>();

                if (externalData == null || !externalData.Success || externalData.Data == null)
                {
                    return this.BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Data nilai tukar tidak ditemukan atau format tidak sesuai.",
                    });
                }

                // Mapping ke DTO standar AumoBackend
                var resultDto = new KursDataDto
                {
                    Base = externalData.Data.Base,
                    Target = externalData.Data.Target,
                    Rate = externalData.Data.Rate,
                    Change = externalData.Data.Change,
                };

                return this.Ok(new ApiResponseDto<KursDataDto>
                {
                    Success = true,
                    Data = resultDto,
                    Message = "Berhasil mendapatkan data nilai tukar rupiah.",
                });
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, "Terjadi kesalahan saat memproses data kurs.");
                return this.StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Terjadi kesalahan internal pada server.",
                });
            }
        }
    }
}

[ApiController]
[Route("/home")]
[Tags("MarketData")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class HomeMarketController : ControllerBase
{
    private readonly IHomeService homeService;
    private readonly ILogger<HomeMarketController> logger;

    public HomeMarketController(IHomeService homeService, ILogger<HomeMarketController> logger)
    {
        this.homeService = homeService;
        this.logger = logger;
    }

    /// <summary>
    /// Indikator pasar untuk halaman Home: kurs USD/IDR dan IHSG.
    /// GET /home/market-indicators.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    [HttpGet("market-indicators")]
    public async Task<IActionResult> GetMarketIndicators()
    {
        try
        {
            var data = await this.homeService.GetMarketIndicatorsAsync();
            return this.Ok(new ApiResponseDto<List<MarketIndicatorDto>>
            {
                Success = data.Count > 0,
                Data = data,
                Message = data.Count > 0
                    ? "Berhasil mendapatkan indikator pasar."
                    : "Data pasar belum tersedia dari penyedia eksternal.",
            });
        }
        catch (Exception ex)
        {
            this.logger.LogError(ex, "Gagal mengambil indikator pasar untuk halaman Home.");
            return this.StatusCode(500, new ApiResponseDto<List<MarketIndicatorDto>>
            {
                Success = false,
                Message = "Terjadi kesalahan internal pada server.",
            });
        }
    }
}
