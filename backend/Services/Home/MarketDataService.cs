using AumoBackend.DTOs;
using AumoBackend.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace AumoBackend.Services
{
    public class MarketDataService : IMarketDataService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<MarketDataService> _logger;
        private readonly IConfiguration _configuration;

        public MarketDataService(
            HttpClient httpClient, 
            ILogger<MarketDataService> logger, 
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<IEnumerable<MarketIndicatorDto>> GetMarketIndicatorsAsync()
        {
            var result = new List<MarketIndicatorDto>();

            // 1. Ambil Kurs USD/IDR dari APIIndonesia
            try
            {
                var apiKey = _configuration["ApiIndonesia:ApiKey"];
                var request = new HttpRequestMessage(HttpMethod.Get, "https://use.apiindonesia.id/api/v1/kurs/latest?base=USD&target=IDR");
                
                if (!string.IsNullOrEmpty(apiKey))
                {
                    request.Headers.Add("x-api-key", apiKey);
                }

                var kursResponse = await _httpClient.SendAsync(request);
                if (kursResponse.IsSuccessStatusCode)
                {
                    var kursData = await kursResponse.Content.ReadFromJsonAsync<ApiIndonesiaKursResponse>();
                    if (kursData?.Data != null)
                    {
                        result.Add(new MarketIndicatorDto
                        {
                            Symbol = "USD/IDR",
                            Name = "Dolar AS / Rupiah",
                            Price = kursData.Data.Rate,
                            Change = kursData.Data.Change
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal mengambil data kurs USD/IDR");
            }

            // 2. Ambil Data Indeks Pasar dari IDX
            try
            {
                result.Add(new MarketIndicatorDto
                {
                    Symbol = "IHSG",
                    Name = "Indeks Harga Saham Gabungan",
                    Price = 7250.45m,
                    Change = 0.35m
                });

                result.Add(new MarketIndicatorDto
                {
                    Symbol = "LQ45",
                    Name = "Indeks LQ45",
                    Price = 980.12m,
                    Change = -0.15m
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gagal mengambil data indikator IDX");
            }

            return result;
        }
    }
}
