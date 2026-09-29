using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class MarketController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

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
            
            // Tambahkan User-Agent standar agar permintaan ke Yahoo Finance tidak diblokir
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            // Panggilan HTTP paralel dengan Task.WhenAll (aman untuk HttpClient)
            var usdTask = FetchSymbolDataAsync(client, "https://query1.finance.yahoo.com/v8/finance/chart/IDR=X", "USD/IDR", "Rupiah", true);
            var ihsgTask = FetchSymbolDataAsync(client, "https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE", "IHSG", "Indeks Saham", false);

            await Task.WhenAll(usdTask, ihsgTask);

            var resultData = new List<object>();

            if (usdTask.Result != null) resultData.Add(usdTask.Result);
            if (ihsgTask.Result != null) resultData.Add(ihsgTask.Result);

            return Ok(new
            {
                success = true,
                data = resultData
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                success = false,
                error = "Gagal mengambil data indikator pasar"
            });
        }
    }

    private static async Task<object?> FetchSymbolDataAsync(
        HttpClient client, 
        string url, 
        string symbol, 
        string name, 
        bool isCurrency)
    {
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
            var cultureInfo = CultureInfo.GetCultureInfo("id-ID");

            string formattedPrice = isCurrency
                ? $"Rp {Math.Round(price):N0}"
                : price.ToString("N2", cultureInfo);

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
            // Jika ada kegagalan parsing atau jaringan pada simbol individual, kembalikan null
            return null;
        }
    }
}
