using System.Data;
using System.Net;
using System.Net.Mail;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using AumoBackend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
// Bawaan Core Identity
using Microsoft.AspNetCore.Identity.UI.Services;

namespace AumoBackend.Services;

// ============ AI SERVICE ============
public interface IAiService { Task<string> AnalyzeFinancialQueryAsync(string userPrompt, string contextData = ""); }
public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<AiService> _logger;
    private const string Model = "gemini-flash-latest";
    public AiService(HttpClient httpClient, IConfiguration configuration, ILogger<AiService> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"]?? string.Empty;
        _logger = logger;
    }
    public async Task<string> AnalyzeFinancialQueryAsync(string userPrompt, string contextData = "")
    {
        if (string.IsNullOrWhiteSpace(_apiKey)) return "AI Service is currently offline.";
        try
        {
            string systemInstruction = @"You are the resident AI Financial Controller for Aumo Finance in Indonesia. CURRENCY MANDATE: 1. ALL monetary values MUST be in Rp. 2. NEVER use USD or '$'. 3. Use dot as thousand separator.";
            string fullPrompt = string.IsNullOrWhiteSpace(contextData)? userPrompt : $"Context Financial Data:\n{contextData}\n\nUser Question: {userPrompt}";
            var requestBody = new { system_instruction = new { parts = new[] { new { text = systemInstruction } } }, contents = new[] { new { role = "user", parts = new[] { new { text = fullPrompt } } } } };
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{Model}:generateContent?key={_apiKey}";
            using var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            if (!response.IsSuccessStatusCode) return "Unable to generate AI analysis at this moment.";
            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return string.IsNullOrWhiteSpace(text)? "Unable to generate AI analysis." : text;
        }
        catch (Exception ex) { _logger.LogError(ex, "Error calling Gemini API."); return "Unable to generate AI analysis."; }
    }
}

// ============ EMAIL - FIX PAKAI BAWAAN CORE IDENTITY ============
public class EmailSender : IEmailSender
{
    private readonly IConfiguration _config; private readonly ILogger<EmailSender> _logger;
    public EmailSender(IConfiguration config, ILogger<EmailSender> logger) { _config = config; _logger = logger; }
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var host = _config["Smtp:Host"]; var port = int.Parse(_config["Smtp:Port"]?? "587");
        var username = _config["Smtp:Username"]; var password = _config["Smtp:Password"];
        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username)) { _logger.LogWarning("SMTP missing"); return; }
        using var client = new SmtpClient(host, port) { Credentials = new NetworkCredential(username, password), EnableSsl = true };
        using var mailMessage = new MailMessage { From = new MailAddress(username, "Aumo Finance"), Subject = subject, Body = htmlMessage, IsBodyHtml = true };
        mailMessage.To.Add(email);
        await client.SendMailAsync(mailMessage);
    }
}
public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;
    public LoggingEmailSender(ILogger<LoggingEmailSender> logger) => _logger = logger;
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        _logger.LogInformation("SIMULATED EMAIL TO: {To} SUBJECT: {Sub}", email, subject);
        return Task.CompletedTask;
    }
}
public class ResendEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration; private readonly ILogger<ResendEmailSender> _logger;
    public ResendEmailSender(IConfiguration configuration, ILogger<ResendEmailSender> logger) { _configuration = configuration; _logger = logger; }
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var apiKey = _configuration["Resend:ApiKey"]?? _configuration["Resend__ApiKey"];
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        var payload = new { from = "Aumo Finance <onboarding@resend.dev>", to = new[] { email }, subject, html = htmlMessage };
        var response = await client.PostAsJsonAsync("https://api.resend.com/emails", payload);
        if (!response.IsSuccessStatusCode) { var err = await response.Content.ReadAsStringAsync(); throw new HttpRequestException(err); }
    }
}
public class IdentityEmailSender : Microsoft.AspNetCore.Identity.IEmailSender<ApplicationUser>
{
    private readonly IEmailSender _mailSender;
    public IdentityEmailSender(IEmailSender mailSender) => _mailSender = mailSender;
    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) => _mailSender.SendEmailAsync(email, "Confirm your email", EmailTemplates.EmailConfirmation(user.FullName, confirmationLink));
    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) => _mailSender.SendEmailAsync(email, "Reset your password", EmailTemplates.PasswordReset(user.FullName, resetLink));
    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode) => _mailSender.SendEmailAsync(email, "Password Reset Code", $"Code: <strong>{resetCode}</strong>");
}
public static class EmailTemplates
{
    private const string AccentColor = "#0d6efd"; private const string DarkColor = "#181818"; private const string MutedColor = "#6c757d";
    public static string EmailConfirmation(string? fullName, string confirmUrl) => Layout("Confirm your email", $"<p>Hi {fullName},</p><p>Thanks for signing up. Confirm your email to activate your account.</p>", "Confirm Email Address", confirmUrl);
    public static string PasswordReset(string? fullName, string resetUrl) => Layout("Reset your password", $"<p>Hi {fullName},</p><p>We received a request to reset your password.</p>", "Reset Password", resetUrl);
    private static string Layout(string heading, string bodyHtml, string buttonText, string buttonUrl) => $@"<!DOCTYPE html><html><body style='font-family:Segoe UI'><div style='background:{DarkColor};padding:20px;color:#fff'>Aumo Finance</div><div style='padding:32px'><h1>{heading}</h1>{bodyHtml}<br/><a href='{buttonUrl}' style='background:{AccentColor};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none'>{buttonText}</a><p style='color:{MutedColor};font-size:12px'>{buttonUrl}</p></div></body></html>";
}

// ============ GUARDIAN / SESSION ============
public interface IGuardianService
{
    Task CreateLoginActivityAsync(Guid userId, string activityType, string device, string browser, string ipAddress, string country, bool isSuccess, string operatingSystem = "Web", string userAgent = "Web");
    Task CreateSessionAsync(Guid userId, string deviceName, string operatingSystem, string browser, string ipAddress, string country, string refreshTokenHash, string userAgent = "Web");
    Task<List<UserSession>> GetActiveSessionsAsync(Guid userId);
    Task RevokeSessionAsync(Guid sessionId, Guid userId);
    Task RevokeAllSessionsAsync(Guid userId);
    Task<List<LoginActivity>> GetLoginActivitiesAsync(Guid userId);
}
public class GuardianService : IGuardianService
{
    private readonly AppDbContext _context;
    public GuardianService(AppDbContext context) => _context = context;
    public async Task CreateLoginActivityAsync(Guid userId, string activityType, string device, string browser, string ipAddress, string country, bool isSuccess, string operatingSystem = "Web", string userAgent = "Web")
    {
        _context.LoginActivities.Add(new LoginActivity { Id = Guid.NewGuid(), UserId = userId, ActivityType = activityType, Device = device, OperatingSystem = operatingSystem, UserAgent = userAgent, Browser = browser, IpAddress = ipAddress, Country = country, IsSuccess = isSuccess, CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();
    }
    public async Task CreateSessionAsync(Guid userId, string deviceName, string operatingSystem, string browser, string ipAddress, string country, string refreshTokenHash, string userAgent = "Web")
    {
        var activeSessions = await _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).OrderByDescending(x => x.LastActivityAt).ToListAsync();
        foreach (var old in activeSessions.Skip(4)) { old.IsActive = false; old.IsCurrent = false; old.RevokedAt = DateTime.UtcNow; }
        foreach (var s in activeSessions) s.IsCurrent = false;
        _context.UserSessions.Add(new UserSession { Id = Guid.NewGuid(), UserId = userId, DeviceName = deviceName, OperatingSystem = operatingSystem, Browser = browser, UserAgent = userAgent, IpAddress = ipAddress, Country = country, RefreshTokenHash = refreshTokenHash, IsActive = true, IsCurrent = true, CreatedAt = DateTime.UtcNow, LastActivityAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();
    }
    public Task<List<UserSession>> GetActiveSessionsAsync(Guid userId) => _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).OrderByDescending(x => x.LastActivityAt).ToListAsync();
    public async Task RevokeSessionAsync(Guid sessionId, Guid userId) { var s = await _context.UserSessions.FirstOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId); if (s == null) return; s.IsActive = false; s.IsCurrent = false; s.RevokedAt = DateTime.UtcNow; await _context.SaveChangesAsync(); }
    public async Task RevokeAllSessionsAsync(Guid userId) { var list = await _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).ToListAsync(); foreach (var s in list) { s.IsActive = false; s.IsCurrent = false; s.RevokedAt = DateTime.UtcNow; } await _context.SaveChangesAsync(); }
    public Task<List<LoginActivity>> GetLoginActivitiesAsync(Guid userId) => _context.LoginActivities.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).Take(50).ToListAsync();
}

// ============ MARKET ============
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
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 AumoFinance/1.0");
            var usdTask = FetchUsdAsync(client); var ihsgTask = FetchIhsgAsync(client); var biTask = FetchBiAsync(client);
            await Task.WhenAll(usdTask, ihsgTask, biTask);
            response.Usd = await usdTask; response.Ihsg = await ihsgTask; response.BiRate = await biTask;
            response.Success = response.Usd!= null || response.Ihsg!= null;
        }
        catch { response.Success = false; }
        return response;
    }
    private async Task<MarketDetail?> FetchUsdAsync(HttpClient client) { try { var res = await client.GetAsync("https://open.er-api.com/v6/latest/USD"); if (!res.IsSuccessStatusCode) return null; using var doc = await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync()); var idr = doc.RootElement.GetProperty("rates").GetProperty("IDR").GetDouble(); return new MarketDetail { Price = idr, Percent = 0.12, IsUp = true }; } catch { return null; } }
    private async Task<MarketDetail?> FetchIhsgAsync(HttpClient client) { try { var res = await client.GetAsync("https://query1.finance.yahoo.com/v8/finance/chart/^JKSE?interval=1d&range=1d"); if (!res.IsSuccessStatusCode) return null; using var doc = await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync()); var meta = doc.RootElement.GetProperty("chart").GetProperty("result")[0].GetProperty("meta"); var cur = meta.GetProperty("regularMarketPrice").GetDouble(); var prev = meta.GetProperty("chartPreviousClose").GetDouble(); var diff = cur - prev; return new MarketDetail { Price = cur, Percent = Math.Abs(diff / prev * 100), IsUp = diff >= 0 }; } catch { return null; } }
    private async Task<string> FetchBiAsync(HttpClient client) { try { var res = await client.GetAsync("https://www.bi.go.id/id/default.aspx"); if (res.IsSuccessStatusCode) { var html = await res.Content.ReadAsStringAsync(); var m = Regex.Match(html, @"BI-Rate[\s\S]*?(\d{1,2}[,\.]\d{2})%", RegexOptions.IgnoreCase); if (m.Success) return $"{m.Groups[1].Value.Replace(',', '.')}%"; } } catch { } return "5.75%"; }
}

// ============ CORE: TRANSACTION NUMBER, CLAIMS, DASHBOARD, KEEP ALIVE ============
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
        string prefix = journalType == "Adjusting"? "AJ" : "GJ"; string counterKey = $"{prefix}{entryDate:yyMM}";
        var conn = _db.Database.GetDbConnection(); if (conn.State!= ConnectionState.Open) await conn.OpenAsync();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO ""TransactionCounters"" (""UserId"", ""CounterKey"", ""LastSequence"") VALUES (@userId, @counterKey, 1) ON CONFLICT (""UserId"", ""CounterKey"") DO UPDATE SET ""LastSequence"" = ""TransactionCounters"".""LastSequence"" + 1 RETURNING ""LastSequence"";";
        var p1 = cmd.CreateParameter(); p1.ParameterName = "userId"; p1.Value = userId; cmd.Parameters.Add(p1);
        var p2 = cmd.CreateParameter(); p2.ParameterName = "counterKey"; p2.Value = counterKey; cmd.Parameters.Add(p2);
        var raw = await cmd.ExecuteScalarAsync()?? throw new InvalidOperationException("Counter failed");
        int seq = Convert.ToInt32(raw); if (seq > 9999) throw new InvalidOperationException($"Sequence {counterKey} full");
        return $"{counterKey}{seq:D4}";
    }
    public async Task<string> PeekNextAsync(Guid userId, string journalType, DateTime entryDate)
    {
        string prefix = journalType == "Adjusting"? "AJ" : "GJ"; string counterKey = $"{prefix}{entryDate:yyMM}";
        var cur = await _db.TransactionCounters.Where(c => c.UserId == userId && c.CounterKey == counterKey).Select(c => (int?)c.LastSequence).FirstOrDefaultAsync();
        return $"{counterKey}{(cur?? 0) + 1:D4}";
    }
}

public class AumoUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole<Guid>>
{
    public AumoUserClaimsPrincipalFactory(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager, IOptions<IdentityOptions> options) : base(userManager, roleManager, options) { }
    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        if (!string.IsNullOrWhiteSpace(user.FullName))
        {
            var existing = identity.FindFirst(ClaimTypes.Name); if (existing!= null) identity.RemoveClaim(existing);
            identity.AddClaim(new Claim(ClaimTypes.Name, user.FullName));
        }
        return identity;
    }
}

public class DashboardDataService
{
    private readonly AppDbContext _db;
    public DashboardDataService(AppDbContext db) => _db = db;
    public async Task<DashboardViewModel> GetDashboardDataAsync(Guid userId, string periodType)
    {
        var selectedPeriod = await SelectedPeriodHelper.GetSelectedPeriodAsync(_db, userId);
        var model = new DashboardViewModel { UserId = userId, HasSelectedPeriod = selectedPeriod!= null };
        if (selectedPeriod == null) return model;
        return model;
    }
}

public class RenderKeepAliveService : BackgroundService
{
    private readonly IHttpClientFactory _httpClientFactory; private readonly ILogger<RenderKeepAliveService> _logger; private readonly IConfiguration _configuration;
    public RenderKeepAliveService(IHttpClientFactory httpClientFactory, ILogger<RenderKeepAliveService> logger, IConfiguration configuration) { _httpClientFactory = httpClientFactory; _logger = logger; _configuration = configuration; }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
        var appUrl = _configuration["AppUrl"]?? Environment.GetEnvironmentVariable("RENDER_EXTERNAL_URL")?? "https://aumo.onrender.com";
        var healthUrl = $"{appUrl.TrimEnd('/')}/health";
        while (!stoppingToken.IsCancellationRequested)
        {
            try { var client = _httpClientFactory.CreateClient(); using var res = await client.GetAsync(healthUrl, stoppingToken); _logger.LogInformation("KeepAlive {Status}", (int)res.StatusCode); } catch { }
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}