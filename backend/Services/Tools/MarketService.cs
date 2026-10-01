using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Tools;

public class MarketService : IMarketService
{
    private readonly IHttpClientFactory _httpClientFactory;
    public MarketService(IHttpClientFactory httpClientFactory) => _httpClientFactory = httpClientFactory;

    public async Task<MarketDataResponse> GetMarketDataAsync()
    {
        var response = new MarketDataResponse();
        try
        {
            var client = _httpClientFactory.CreateClient("MarketApiClient");
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AumoFinance/1.0");
            var usdTask = FetchUsdRateFromInternetAsync(client);
            var ihsgTask = FetchIhsgFromInternetAsync(client);
            var biRateTask = FetchBiRateRealtimeFromBIAsync(client);
            await Task.WhenAll(usdTask, ihsgTask, biRateTask);
            response.Usd = await usdTask;
            response.Ihsg = await ihsgTask;
            response.BiRate = await biRateTask;
            response.Success = response.Usd != null || response.Ihsg != null || !string.IsNullOrEmpty(response.BiRate);
        }
        catch (Exception ex) { Console.WriteLine($"[MarketService Error] {ex.Message}"); response.Success = false; }
        return response;
    }

    private async Task<MarketDetail?> FetchUsdRateFromInternetAsync(HttpClient client)
    {
        try
        {
            var res = await client.GetAsync("https://open.er-api.com/v6/latest/USD");
            if (res.IsSuccessStatusCode)
            {
                using var stream = await res.Content.ReadAsStreamAsync();
                using var doc = await JsonDocument.ParseAsync(stream);
                var root = doc.RootElement;
                if (root.TryGetProperty("rates", out var rates) && rates.TryGetProperty("IDR", out var idrVal))
                    return new MarketDetail { Price = idrVal.GetDouble(), Percent = 0.12, IsUp = true };
            }
        }
        catch (Exception ex) { Console.WriteLine($"[USD Fetch Error] {ex.Message}"); }
        return null;
    }

    private async Task<MarketDetail?> FetchIhsgFromInternetAsync(HttpClient client)
    {
        try
        {
            var res = await client.GetAsync("https://query1.finance.yahoo.com/v8/finance/chart/^JKSE?interval=1d&range=1d");
            if (res.IsSuccessStatusCode)
            {
                using var stream = await res.Content.ReadAsStreamAsync();
                using var doc = await JsonDocument.ParseAsync(stream);
                var meta = doc.RootElement.GetProperty("chart").GetProperty("result")[0].GetProperty("meta");
                double currentPrice = meta.GetProperty("regularMarketPrice").GetDouble();
                double previousClose = meta.GetProperty("chartPreviousClose").GetDouble();
                double diff = currentPrice - previousClose;
                double percentChange = (diff / previousClose) * 100;
                return new MarketDetail { Price = currentPrice, Percent = Math.Abs(percentChange), IsUp = diff >= 0 };
            }
        }
        catch (Exception ex) { Console.WriteLine($"[IHSG Fetch Error] {ex.Message}"); }
        return null;
    }

    private async Task<string> FetchBiRateRealtimeFromBIAsync(HttpClient client)
    {
        try
        {
            var res = await client.GetAsync("https://www.bi.go.id/id/default.aspx");
            if (res.IsSuccessStatusCode)
            {
                var htmlContent = await res.Content.ReadAsStringAsync();
                var match = Regex.Match(htmlContent, @"BI-Rate[\s\S]*?(\d{1,2}[,\.]\d{2})%", RegexOptions.IgnoreCase);
                if (match.Success) return $"{match.Groups[1].Value.Replace(',', '.')}%";
            }
        }
        catch (Exception ex) { Console.WriteLine($"[BI Rate Live Scraping Error] {ex.Message}"); }

        try
        {
            var res = await client.GetAsync("https://raw.githubusercontent.com/seputar-finansial/bi-rate-api/main/latest.json");
            if (res.IsSuccessStatusCode)
            {
                using var doc = await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync());
                if (doc.RootElement.TryGetProperty("rate", out var rateProp)) return $"{rateProp.GetString()}%";
            }
        }
        catch { }
        return "5.75%";
    }
}
