using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Home;

public class HomeService : IHomeService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private static readonly CultureInfo IdCulture = CultureInfo.GetCultureInfo("id-ID");

    public HomeService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync()
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(5);

        client.DefaultRequestHeaders.UserAgent.Clear();
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        var usdTask = FetchUsdRateAsync(client);
        var ihsgTask = FetchIhsgAsync(client);

        await Task.WhenAll(usdTask, ihsgTask);

        var usdResult = await usdTask;
        var ihsgResult = await ihsgTask;

        var resultData = new List<MarketIndicatorDto>();

        if (usdResult != null) resultData.Add(usdResult);
        if (ihsgResult != null) resultData.Add(ihsgResult);

        return resultData;
    }

    private static async Task<MarketIndicatorDto?> FetchUsdRateAsync(HttpClient client)
    {
        const string yahooUrl = "https://query1.finance.yahoo.com/v8/finance/chart/IDR=X";
        var yahooResult = await FetchYahooChartDataAsync(client, yahooUrl, "USD/IDR", "Rupiah", isCurrency: true);
        if (yahooResult != null) return yahooResult;

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
                return new MarketIndicatorDto
                {
                    Symbol = "USD/IDR",
                    Name = "Rupiah",
                    Price = $"Rp {Math.Round(rate):N0}",
                    Change = "+0.00%",
                    IsUp = true
                };
            }
        }
        catch
        {
            // Abaikan error fallback
        }

        return null;
    }

    private static async Task<MarketIndicatorDto?> FetchIhsgAsync(HttpClient client)
    {
        const string yahooUrl = "https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE";
        return await FetchYahooChartDataAsync(client, yahooUrl, "IHSG", "Indeks Saham", isCurrency: false);
    }

    private static async Task<MarketIndicatorDto?> FetchYahooChartDataAsync(
        HttpClient client,
        string url,
        string symbol,
        string name,
        bool isCurrency)
    {
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

            return new MarketIndicatorDto
            {
                Symbol = symbol,
                Name = name,
                Price = formattedPrice,
                Change = formattedChange,
                IsUp = changePercent >= 0
            };
        }
        catch
        {
            return null;
        }
    }
}
