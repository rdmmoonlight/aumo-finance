using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class HomeController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private static readonly CultureInfo IdCulture = CultureInfo.GetCultureInfo("id-ID");

    public MarketController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetMarketIndicators()
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);

            // User-Agent wajib untuk menghindari HTTP 403 Forbidden dari Yahoo Finance
            client.DefaultRequestHeaders.UserAgent.Clear();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            // Jalankan pencarian data pasar secara paralel
            var usdTask = FetchUsdRateAsync(client);
            var ihsgTask = FetchIhsgAsync(client);

            await Task.WhenAll(usdTask, ihsgTask);

            var usdResult = await usdTask;
            var ihsgResult = await ihsgTask;

            var resultData = new List<object>();

            if (usdResult != null) resultData.Add(usdResult);
            if (ihsgResult != null) resultData.Add(ihsgResult);

            return Ok(new
            {
                success = true,
                data = resultData
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                error = "Gagal mengambil data indikator pasar",
                message = ex.Message
            });
        }
    }

    private static async Task<object?> FetchUsdRateAsync(HttpClient client)
    {
        // 1. Coba via Yahoo Finance (Wajib HTTPS)
        const string yahooUrl = "https://query1.finance.yahoo.com/v8/finance/chart/IDR=X";
        var yahooResult = await FetchYahooChartDataAsync(client, yahooUrl, "USD/IDR", "Rupiah", isCurrency: true);
        if (yahooResult != null) return yahooResult;

        // 2. Fallback via Open Exchange Rates API jika Yahoo memblokir (Wajib HTTPS)
        try
        {
            const string fallbackUrl = "https://open.er-api.com/v6/latest/USD";
            var response = await client.GetAsync(fallbackUrl);
            if (!response.IsSuccessStatusCode) return null;

            using var stream = await response.Content.ReadAsStreamAsync();
            using var jsonDoc = await JsonDocument.ParseAsync(stream);

            if (jsonDoc.RootElement.TryGetProperty("rates", out var rates) &&
                rates.TryGetProperty("IDR", out var idrElement))
            {
                decimal rate = idrElement.GetDecimal();
                return new
                {
                    symbol = "USD/IDR",
                    name = "Rupiah",
                    price = $"Rp {Math.Round(rate):N0}",
                    change = "+0.00%",
                    isUp = true
                };
            }
        }
        catch
        {
            // Abaikan kesalahan fallback, kembalikan null
        }

        return null;
    }

    private static async Task<object?> FetchIhsgAsync(HttpClient client)
    {
        // Wajib HTTPS
        const string yahooUrl = "https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE";
        return await FetchYahooChartDataAsync(client, yahooUrl, "IHSG", "Indeks Saham", isCurrency: false);
    }

    private static async Task<object?> FetchYahooChartDataAsync(
        HttpClient client,
        string url,
        string symbol,
        string name,
        bool isCurrency)
    {
        // Validasi Protokol HTTPS
        if (!url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Request URL wajib menggunakan protokol HTTPS.");
        }

        try
        {
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var stream = await response.Content.ReadAsStreamAsync();
            using var jsonDoc = await JsonDocument.ParseAsync(stream);

            var root = jsonDoc.RootElement;
            if (!root.TryGetProperty("chart", out var chart) ||
                !chart.TryGetProperty("result", out var result) ||
                result.GetArrayLength() == 0)
            {
                return null;
            }

            var meta = result[0].GetProperty("meta");

            if (!meta.TryGetProperty("regularMarketPrice", out var priceElement))
            {
                return null;
            }

            decimal price = priceElement.GetDecimal();
            decimal prevClose = price;

            if (meta.TryGetProperty("chartPreviousClose", out var prevCloseElement) ||
                meta.TryGetProperty("previousClose", out prevCloseElement))
            {
                prevClose = prevCloseElement.GetDecimal();
            }

            decimal changePercent = prevClose != 0 ? ((price - prevClose) / prevClose) * 100 : 0;

            string formattedPrice = isCurrency
                ? $"Rp {Math.Round(price):N0}"
                : price.ToString("N2", IdCulture);

            string formattedChange = $"{(changePercent >= 0 ? "+" : "")}{changePercent:F2}%";

            return new
            {
                symbol,
                name,
                price = formattedPrice,
                change = formattedChange,
                isUp = changePercent >= 0
            };
        }
        catch
        {
            return null;
        }
    }
}
