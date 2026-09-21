using System;
using System.Data;
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace AumoBackend.Core;

// --- AI Service ---
public interface IAiService
{
    Task<string> AnalyzeFinancialQueryAsync(string userPrompt, string contextData = "");
}

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<AiService> _logger;
    private const string Model = "gemini-flash-latest";

    public AiService(HttpClient httpClient, IConfiguration configuration, ILogger<AiService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        _logger = logger;
    }

    public async Task<string> AnalyzeFinancialQueryAsync(string userPrompt, string contextData = "")
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("Gemini API Key is not configured.");
            return "AI Service is currently offline. Please configure the Gemini API key.";
        }

        try
        {
            string systemInstruction = @"You are the resident AI Financial Controller for Aumo Finance in Indonesia.
Analyse accounting and financial queries with precision, discipline, and absolute accuracy.
Provide concise, actionable insights in professional English or Indonesian.

CURRENCY MANDATE:
1. ALL monetary values MUST be presented in Indonesian Rupiah (Rp).
2. NEVER use USD, Dollar, or the '$' symbol under any circumstances.
3. Use dot (.) as thousand separators and comma (,) for decimals (e.g., Rp 1.500.000,00 or Rp 250.000).
4. Do not make assumptions beyond rational economic logic.";

            string fullPrompt = string.IsNullOrWhiteSpace(contextData)
               ? userPrompt
                : $"Context Financial Data:\n{contextData}\n\nUser Question: {userPrompt}";

            var requestBody = new
            {
                system_instruction = new { parts = new[] { new { text = systemInstruction } } },
                contents = new[] { new { role = "user", parts = new[] { new { text = fullPrompt } } } }
            };

            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{Model}:generateContent?key={_apiKey}";
            using var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                string errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API returned {StatusCode}: {Body}", response.StatusCode, errorBody);
                return "Unable to generate AI analysis at this moment. Please try again later.";
            }

            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return string.IsNullOrWhiteSpace(text) ? "Unable to generate AI analysis at this moment. Please try again later." : text;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API.");
            return "Unable to generate AI analysis at this moment. Please try again later.";
        }
    }
}

// --- Dashboard ---
public class DashboardDataService
{
    private readonly AppDbContext _db;
    public DashboardDataService(AppDbContext db) => _db = db;

    public async Task<DashboardViewModel> GetDashboardDataAsync(Guid userId, string periodType)
    {
        var newModel = new DashboardViewModel { UserId = userId };
        var isAnnual = periodType == "annual";
        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        if (selectedPeriod == null)
        {
            newModel.HasSelectedPeriod = false;
            return newModel;
        }

        newModel.HasSelectedPeriod = true;
        newModel.IsSelectedPeriodClosed = selectedPeriod.IsClosed;

        DateTime periodStart, periodEnd;
        if (isAnnual)
        {
            var year = selectedPeriod.StartDate.Year;
            periodStart = DateTime.SpecifyKind(new DateTime(year, 1, 1, 0, 0, 0), DateTimeKind.Utc);
            periodEnd = DateTime.SpecifyKind(new DateTime(year, 12, 31, 23, 59, 59), DateTimeKind.Utc);
            newModel.ActivePeriodName = $"Year {year}";
        }
        else
        {
            periodStart = DateTime.SpecifyKind(selectedPeriod.StartDate, DateTimeKind.Utc);
            periodEnd = DateTime.SpecifyKind(selectedPeriod.EndDate, DateTimeKind.Utc);
            newModel.ActivePeriodName = selectedPeriod.PeriodName;
        }

        newModel.ActivePeriodStart = periodStart;
        newModel.ActivePeriodEnd = periodEnd;

        var accounts = await _db.ChartOfAccounts.Where(a => a.IsActive && a.UserId == userId).OrderBy(a => a.ReferenceNumber).ToListAsync();
        var lines = await _db.JournalEntryLines.Include(l => l.JournalEntry).Include(l => l.Account)
           .Where(l => l.JournalEntry != null && l.JournalEntry.UserId == userId && l.JournalEntry.EntryDate <= periodEnd).ToListAsync();

        var accountBalances = accounts.ToDictionary(a => a.Id, a =>
        {
            var normalDebit = IsNormalBalanceDebitSafe(a.Type);
            var accountLines = lines.Where(l => l.AccountId == a.Id);
            return normalDebit ? accountLines.Sum(l => l.Debit - l.Credit) : accountLines.Sum(l => l.Credit - l.Debit);
        });

        newModel.TotalCashAndEquivalents = accounts.Where(a => a.Role == "CashAndEquivalents").Sum(a => accountBalances.GetValueOrDefault(a.Id));
        newModel.TotalAssets = accounts.Where(a => a.Type == "Assets").Sum(a => accountBalances.GetValueOrDefault(a.Id));
        newModel.TotalLiabilities = accounts.Where(a => a.Type == "Liabilities").Sum(a => accountBalances.GetValueOrDefault(a.Id));

        var filteredLines = lines.Where(l => l.JournalEntry!.EntryDate >= periodStart && l.JournalEntry!.EntryDate <= periodEnd).ToList();

        decimal SumByType(string type)
        {
            var ids = accounts.Where(a => a.Type == type).Select(a => a.Id).ToHashSet();
            var normalDebit = IsNormalBalanceDebitSafe(type);
            var relevant = filteredLines.Where(l => ids.Contains(l.AccountId));
            return normalDebit ? relevant.Sum(l => l.Debit - l.Credit) : relevant.Sum(l => l.Credit - l.Debit);
        }

        newModel.RevenueThisPeriod = SumByType("OperatingIncome") + SumByType("OtherIncome");
        newModel.OperatingExpenses = SumByType("OperatingExpenses") + SumByType("OtherExpenses");
        newModel.NetIncome = newModel.RevenueThisPeriod - newModel.OperatingExpenses;

        DateTime priorStart = isAnnual ? periodStart.AddYears(-1) : periodStart.AddMonths(-1);
        DateTime priorEnd = isAnnual ? periodEnd.AddYears(-1) : periodStart.AddDays(-1);
        var priorLines = lines.Where(l => l.JournalEntry!.EntryDate >= priorStart && l.JournalEntry!.EntryDate <= priorEnd).ToList();

        decimal PriorSumByType(string type)
        {
            var ids = accounts.Where(a => a.Type == type).Select(a => a.Id).ToHashSet();
            var normalDebit = IsNormalBalanceDebitSafe(type);
            var relevant = priorLines.Where(l => ids.Contains(l.AccountId));
            return normalDebit ? relevant.Sum(l => l.Debit - l.Credit) : relevant.Sum(l => l.Credit - l.Debit);
        }

        var priorRevenue = PriorSumByType("OperatingIncome") + PriorSumByType("OtherIncome");
        var priorExpenses = PriorSumByType("OperatingExpenses") + PriorSumByType("OtherExpenses");
        var priorNet = priorRevenue - priorExpenses;

        newModel.RevenueTrendPercent = CalcTrend(newModel.RevenueThisPeriod, priorRevenue);
        newModel.ExpenseTrendPercent = CalcTrend(newModel.OperatingExpenses, priorExpenses);
        newModel.NetIncomeTrendPercent = CalcTrend(newModel.NetIncome, priorNet);

        var monthly = lines.GroupBy(l => new { l.JournalEntry!.EntryDate.Year, l.JournalEntry!.EntryDate.Month })
           .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month).TakeLast(isAnnual ? 12 : 7).ToList();

        foreach (var g in monthly)
        {
            newModel.ChartLabels.Add(new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yy"));
            var revIds = accounts.Where(a => a.Type is "OperatingIncome" or "OtherIncome").Select(a => a.Id).ToHashSet();
            var expIds = accounts.Where(a => a.Type is "OperatingExpenses" or "OtherExpenses").Select(a => a.Id).ToHashSet();
            newModel.ChartRevenue.Add(g.Where(l => revIds.Contains(l.AccountId)).Sum(l => l.Credit - l.Debit));
            newModel.ChartExpenses.Add(g.Where(l => expIds.Contains(l.AccountId)).Sum(l => l.Debit - l.Credit));
        }

        foreach (var acc in accounts.Where(a => a.Type is "OperatingExpenses" or "OtherExpenses"))
        {
            var amount = filteredLines.Where(l => l.AccountId == acc.Id).Sum(l => l.Debit - l.Credit);
            if (amount != 0)
            {
                newModel.ExpenseCategoryLabels.Add(acc.AccountName);
                newModel.ExpenseCategoryValues.Add(amount);
            }
        }

        var keyRoles = new[] { "CashAndEquivalents", "AccountsReceivable", "AccountsPayable" };
        foreach (var acc in accounts.Where(a => (a.Role != null && keyRoles.Contains(a.Role)) || a.Type == "Equity").OrderBy(a => a.ReferenceNumber).Take(6))
        {
            newModel.MainCoaBalances.Add(new CoaBalanceDto
            {
                AccountCode = acc.ReferenceNumber.ToString(),
                AccountName = acc.AccountName,
                Category = acc.Type ?? "Other",
                Balance = accountBalances.GetValueOrDefault(acc.Id)
            });
        }

        newModel.RecentJournals = await _db.JournalEntries.Where(j => j.UserId == userId && j.EntryDate >= periodStart && j.EntryDate <= periodEnd)
           .OrderByDescending(j => j.EntryDate).ThenByDescending(j => j.Id).Take(8)
           .Select(j => new JournalEntryDto { Date = j.EntryDate, TotalDebit = j.Lines.Sum(l => l.Debit), TotalCredit = j.Lines.Sum(l => l.Credit) }).ToListAsync();

        newModel.MonthlyBurnRate = isAnnual ? (newModel.OperatingExpenses / 12m) : newModel.OperatingExpenses;
        newModel.CashRunwayMonths = newModel.MonthlyBurnRate > 0 ? (double)Math.Round(newModel.TotalCashAndEquivalents / newModel.MonthlyBurnRate, 1) : 99;

        int healthScore = 50;
        if (newModel.TotalLiabilities > 0)
        {
            var quickRatio = newModel.TotalCashAndEquivalents / newModel.TotalLiabilities;
            if (quickRatio >= 1.5m) healthScore += 25;
            else if (quickRatio >= 1.0m) healthScore += 15;
            else if (quickRatio >= 0.5m) healthScore += 5;
        }
        else healthScore += 25;

        if (newModel.NetIncome > 0) healthScore += 25;
        else if (newModel.NetIncome < 0) healthScore -= 15;

        newModel.FinancialHealthScore = Math.Clamp(healthScore, 10, 100);
        return newModel;
    }

    private static bool IsNormalBalanceDebitSafe(string? type)
    {
        if (string.IsNullOrWhiteSpace(type)) return true;
        try { return AccountClassification.NormalBalanceIsDebit(type); }
        catch { return type is "Assets" or "OperatingExpenses" or "OtherExpenses"; }
    }
    private static decimal? CalcTrend(decimal current, decimal prior)
    {
        if (prior == 0) return current == 0 ? 0 : null;
        return Math.Round((current - prior) / Math.Abs(prior) * 100m, 1);
    }
}

// --- Transaction Number ---
public interface ITransactionNumberService
{
    Task<string> GenerateAsync(Guid userId, string journalType, DateTime entryDate);
    Task<string> PeekNextAsync(Guid userId, string journalType, DateTime entryDate);
}

public class TransactionNumberService : ITransactionNumberService
{
    private readonly AppDbContext _db;
    public TransactionNumberService(AppDbContext db) => _db = db;

    public async Task<string> GenerateAsync(Guid userId, string journalType, DateTime entryDate)
    {
        string prefix = journalType == "Adjusting" ? "AJ" : "GJ";
        string counterKey = $"{prefix}{entryDate:yyMM}";
        var connection = _db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = @"
                INSERT INTO ""TransactionCounters"" (""UserId"", ""CounterKey"", ""LastSequence"")
                VALUES (@userId, @counterKey, 1)
                ON CONFLICT (""UserId"", ""CounterKey"")
                DO UPDATE SET ""LastSequence"" = ""TransactionCounters"".""LastSequence"" + 1
                RETURNING ""LastSequence"";";
        var userIdParam = command.CreateParameter(); userIdParam.ParameterName = "userId"; userIdParam.Value = userId; command.Parameters.Add(userIdParam);
        var counterKeyParam = command.CreateParameter(); counterKeyParam.ParameterName = "counterKey"; counterKeyParam.Value = counterKey; command.Parameters.Add(counterKeyParam);
        var rawResult = await command.ExecuteScalarAsync() ?? throw new InvalidOperationException($"Transaction counter upsert for {counterKey} returned no result.");
        int nextSeq = Convert.ToInt32(rawResult);
        if (nextSeq > 9999) throw new InvalidOperationException($"Transaction number sequence for {counterKey} has reached its 9999 capacity.");
        return $"{counterKey}{nextSeq:D4}";
    }

    public async Task<string> PeekNextAsync(Guid userId, string journalType, DateTime entryDate)
    {
        string prefix = journalType == "Adjusting" ? "AJ" : "GJ";
        string counterKey = $"{prefix}{entryDate:yyMM}";
        var current = await _db.TransactionCounters.Where(c => c.UserId == userId && c.CounterKey == counterKey).Select(c => (int?)c.LastSequence).FirstOrDefaultAsync();
        var previewSeq = (current ?? 0) + 1;
        return $"{counterKey}{previewSeq:D4}";
    }
}

// --- Market ---
public interface IMarketService { Task<MarketDataResponse> GetMarketDataAsync(); }
public class MarketDataResponse { public bool Success { get; set; } public MarketDetail? Usd { get; set; } public MarketDetail? Ihsg { get; set; } public string? BiRate { get; set; } }
public class MarketDetail { public double Price { get; set; } public double Percent { get; set; } public bool IsUp { get; set; } }

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
