using System.Net.Http.Json;
using AumoBackend.DTOs;
using AumoBackend.DTOs.External;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers.Api
{
    [ApiController]
    [Route("api/v1")]
    public class MarketDataController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MarketDataController> _logger;

        public MarketDataController(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<MarketDataController> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint untuk mengambil nilai tukar mata uang (Default: USD ke IDR)
        /// GET /api/v1/kurs?base=USD&target=IDR
        /// </summary>
        [HttpGet("kurs")]
        public async Task<IActionResult> GetKurs([FromQuery] string baseCurrency = "USD", [FromQuery] string targetCurrency = "IDR")
        {
            try
            {
                var apiKey = _configuration["ApiIndonesia:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("API Key untuk ApiIndonesia belum dikonfigurasi.");
                    return StatusCode(500, new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Konfigurasi API Key tidak ditemukan."
                    });
                }

                var requestUrl = $"https://use.apiindonesia.id/api/v1/kurs/latest?base={baseCurrency}&target={targetCurrency}";

                using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("x-api-key", apiKey);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gagal mengambil data dari provider eksternal. Status: {StatusCode}", response.StatusCode);
                    return StatusCode((int)response.StatusCode, new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Gagal mengambil data nilai tukar dari layanan eksternal."
                    });
                }

                // Deserialisasi response dari APIIndonesia
                var externalData = await response.Content.ReadFromJsonAsync<AumoBackend.DTOs.External.ApiIndonesiaKursResponse>();

                if (externalData == null || !externalData.Success || externalData.Data == null)
                {
                    return BadRequest(new ApiResponseDto<object>
                    {
                        Success = false,
                        Message = "Data nilai tukar tidak ditemukan atau format tidak sesuai."
                    });
                }

                // Mapping ke DTO standar AumoBackend
                var resultDto = new KursDataDto
                {
                    Base = externalData.Data.Base,
                    Target = externalData.Data.Target,
                    Rate = externalData.Data.Rate,
                    Change = externalData.Data.Change
                };

                return Ok(new ApiResponseDto<KursDataDto>
                {
                    Success = true,
                    Data = resultDto,
                    Message = "Berhasil mendapatkan data nilai tukar rupiah."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Terjadi kesalahan saat memproses data kurs.");
                return StatusCode(500, new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "Terjadi kesalahan internal pada server."
                });
            }
        }
    }
}
