using System;
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AumoBackend.Core;

// --- Claims ---
public class AumoUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole<Guid>>
{
    public AumoUserClaimsPrincipalFactory(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager, IOptions<IdentityOptions> options) : base(userManager, roleManager, options) { }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        if (!string.IsNullOrWhiteSpace(user.FullName))
        {
            var existingName = identity.FindFirst(ClaimTypes.Name);
            if (existingName is not null) identity.RemoveClaim(existingName);
            identity.AddClaim(new Claim(ClaimTypes.Name, user.FullName));
        }
        return identity;
    }
}

// --- Storage ---
public interface ICloudStorageService
{
    Task<(string PublicId, string Url, long FileSize)> UploadFileAsync(IFormFile file, string folderName = "documents");
    Task<bool> DeleteFileAsync(string publicId);
}

public class CloudinaryService : ICloudStorageService
{
    private readonly Cloudinary _cloudinary;
    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(config["CloudinarySettings:CloudName"], config["CloudinarySettings:ApiKey"], config["CloudinarySettings:ApiSecret"]);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<(string PublicId, string Url, long FileSize)> UploadFileAsync(IFormFile file, string folderName = "documents")
    {
        if (file == null || file.Length == 0) throw new ArgumentException("File tidak boleh kosong.");
        using var stream = file.OpenReadStream();
        var uploadParams = new RawUploadParams { File = new FileDescription(file.FileName, stream), Folder = folderName, UseFilename = true, UniqueFilename = true };
        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        if (uploadResult.Error != null) throw new Exception($"Cloudinary Upload Error: {uploadResult.Error.Message}");
        return (uploadResult.PublicId, uploadResult.SecureUrl.ToString(), uploadResult.Bytes);
    }

    public async Task<bool> DeleteFileAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}

// --- Email Core ---
public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string htmlMessage, CancellationToken ct = default);
}

public class EmailSender : IEmailSender
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailSender> _logger;
    public EmailSender(IConfiguration config, ILogger<EmailSender> logger) { _config = config; _logger = logger; }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage, CancellationToken ct = default)
    {
        var host = _config["Smtp:Host"];
        var port = int.Parse(_config["Smtp:Port"] ?? "587");
        var username = _config["Smtp:Username"];
        var password = _config["Smtp:Password"];
        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username))
        {
            _logger.LogWarning("SMTP Configuration is missing. Skipping email send to {Email}", toEmail);
            return;
        }
        using var client = new SmtpClient(host, port) { Credentials = new NetworkCredential(username, password), EnableSsl = true };
        using var mailMessage = new MailMessage { From = new MailAddress(username, "Aumo Finance"), Subject = subject, Body = htmlMessage, IsBodyHtml = true };
        mailMessage.To.Add(toEmail);
        _logger.LogInformation("Attempting to send email to {Email} via SMTP...", toEmail);
        await Task.Run(() => client.SendMailAsync(mailMessage), ct);
        _logger.LogInformation("Email successfully sent to {Email}", toEmail);
    }
}

public class ResendEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailSender> _logger;
    public ResendEmailSender(IConfiguration configuration, ILogger<ResendEmailSender> logger) { _configuration = configuration; _logger = logger; }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage, CancellationToken ct = default)
    {
        var apiKey = _configuration["Resend:ApiKey"] ?? _configuration["Resend__ApiKey"];
        if (string.IsNullOrEmpty(apiKey) || apiKey.Contains("xxxxxxxxx"))
        {
            _logger.LogError("Resend API Key is missing!");
            throw new InvalidOperationException("Resend API Key is not configured on the server.");
        }
        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            var payload = new { from = "Aumo Finance <onboarding@resend.dev>", to = new[] { toEmail }, subject = subject, html = htmlMessage };
            var response = await client.PostAsJsonAsync("https://api.resend.com/emails", payload, ct);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Failed to send email via Resend API. Response: {Error}", errorBody);
                throw new HttpRequestException($"Resend API Error ({response.StatusCode}): {errorBody}");
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail); throw; }
    }
}

public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;
    public LoggingEmailSender(ILogger<LoggingEmailSender> logger) => _logger = logger;
    public Task SendEmailAsync(string toEmail, string subject, string htmlMessage, CancellationToken ct = default)
    {
        _logger.LogInformation("SIMULATED EMAIL TO: {ToEmail} SUBJECT: {Subject}", toEmail, subject);
        return Task.CompletedTask;
    }
}

public class IdentityEmailSender : Microsoft.AspNetCore.Identity.IEmailSender<ApplicationUser>
{
    private readonly IEmailSender _mailSender;
    public IdentityEmailSender(IEmailSender mailSender) => _mailSender = mailSender;
    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink)
    {
        var htmlBody = $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.";
        return _mailSender.SendEmailAsync(email, "Confirm your email - Aumo Finance", htmlBody);
    }
    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink)
    {
        var htmlBody = $"Please reset your password by <a href='{resetLink}'>clicking here</a>.";
        return _mailSender.SendEmailAsync(email, "Reset your password - Aumo Finance", htmlBody);
    }
    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode)
    {
        var htmlBody = $"Your password reset code is: <strong>{resetCode}</strong>";
        return _mailSender.SendEmailAsync(email, "Password Reset Code - Aumo Finance", htmlBody);
    }
}

public static class EmailTemplates
{
    private const string AccentColor = "#0d6efd";
    private const string DarkColor = "#181818";
    private const string MutedColor = "#6c757d";

    public static string EmailConfirmation(string? fullName, string confirmUrl) => Layout("Confirm your email to activate your Aumo Finance account.", "Confirm your email",
        $@"<p>Hi {(string.IsNullOrWhiteSpace(fullName) ? "there" : fullName)},</p><p>Thanks for signing up for Aumo Finance. Confirm your email address to activate your account.</p>", "Confirm Email Address", confirmUrl);

    public static string PasswordReset(string? fullName, string resetUrl) => Layout("Reset the password for your Aumo Finance account.", "Reset your password",
        $@"<p>Hi {(string.IsNullOrWhiteSpace(fullName) ? "there" : fullName)},</p><p>We received a request to reset the password for your Aumo Finance account.</p>", "Reset Password", resetUrl);

    private static string Layout(string previewText, string heading, string bodyHtml, string buttonText, string buttonUrl)
    {
        return $@"<!DOCTYPE html><html><body style=""background-color:#f2f3f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;""><div style=""display:none;"">{previewText}</div><table width=""100%"" style=""padding:32px 16px;""><tr><td align=""center""><table style=""max-width:480px;background:#fff;border-radius:8px;""><tr><td style=""background:{DarkColor};padding:20px 32px;color:#fff;font-weight:700;"">Aumo Finance</td></tr><tr><td style=""padding:32px;""><h1>{heading}</h1>{bodyHtml}<a href=""{buttonUrl}"" style=""display:inline-block;padding:12px 28px;background:{AccentColor};color:#fff;text-decoration:none;border-radius:6px;"">{buttonText}</a><p style=""color:{MutedColor};font-size:12px;"">Or copy: <a href=""{buttonUrl}"">{buttonUrl}</a></p></td></tr><tr><td style=""padding:20px 32px;background:#f8f9fa;font-size:12px;color:{MutedColor};"">&copy; {DateTime.UtcNow.Year} Aumo Finance</td></tr></table></td></tr></table></body></html>";
    }
}

// --- Guardian / Session ---
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
        var activity = new LoginActivity { Id = Guid.NewGuid(), UserId = userId, ActivityType = activityType, Device = string.IsNullOrWhiteSpace(device) ? "Web" : device, OperatingSystem = string.IsNullOrWhiteSpace(operatingSystem) ? "Web" : operatingSystem, UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "Web" : userAgent, Browser = string.IsNullOrWhiteSpace(browser) ? "Browser" : browser, IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "0.0.0.0" : ipAddress, Country = string.IsNullOrWhiteSpace(country) ? "ID" : country, IsSuccess = isSuccess, CreatedAt = DateTime.UtcNow };
        _context.LoginActivities.Add(activity);
        await _context.SaveChangesAsync();
    }

    public async Task CreateSessionAsync(Guid userId, string deviceName, string operatingSystem, string browser, string ipAddress, string country, string refreshTokenHash, string userAgent = "Web")
    {
        var activeSessions = await _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).OrderByDescending(x => x.LastActivityAt).ToListAsync();
        var sessionsToRevoke = activeSessions.Skip(4).ToList();
        foreach (var oldSession in sessionsToRevoke) { oldSession.IsActive = false; oldSession.IsCurrent = false; oldSession.RevokedAt = DateTime.UtcNow; }
        foreach (var session in activeSessions) session.IsCurrent = false;

        var newSession = new UserSession { Id = Guid.NewGuid(), UserId = userId, DeviceName = string.IsNullOrWhiteSpace(deviceName) ? "Web" : deviceName, OperatingSystem = string.IsNullOrWhiteSpace(operatingSystem) ? "Web" : operatingSystem, Browser = string.IsNullOrWhiteSpace(browser) ? "Browser" : browser, UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "Web" : userAgent, IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "0.0.0.0" : ipAddress, Country = string.IsNullOrWhiteSpace(country) ? "ID" : country, RefreshTokenHash = string.IsNullOrWhiteSpace(refreshTokenHash) ? "COOKIE_SESSION" : refreshTokenHash, IsActive = true, IsCurrent = true, CreatedAt = DateTime.UtcNow, LastActivityAt = DateTime.UtcNow };
        _context.UserSessions.Add(newSession);
        await _context.SaveChangesAsync();
    }

    public async Task<List<UserSession>> GetActiveSessionsAsync(Guid userId) => await _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).OrderByDescending(x => x.LastActivityAt).ToListAsync();
    public async Task RevokeSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _context.UserSessions.FirstOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId);
        if (session == null) return;
        session.IsActive = false; session.IsCurrent = false; session.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
    public async Task RevokeAllSessionsAsync(Guid userId)
    {
        var activeSessions = await _context.UserSessions.Where(x => x.UserId == userId && x.IsActive).ToListAsync();
        foreach (var session in activeSessions) { session.IsActive = false; session.IsCurrent = false; session.RevokedAt = DateTime.UtcNow; }
        await _context.SaveChangesAsync();
    }
    public async Task<List<LoginActivity>> GetLoginActivitiesAsync(Guid userId) => await _context.LoginActivities.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).Take(50).ToListAsync();
}

// ==========================================
// FILE 1: Core/Entities/Notification.cs
// ==========================================
public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Foreign key ke ApplicationUser (Guid)
    public Guid UserId { get; set; } 
    
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info"; // "info", "warning", "error"
    public bool IsRead { get; set; } = false;
    public string? TargetUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


// ==========================================
// FILE 2: DTOs/NotificationDto.cs
// ==========================================
public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? TargetUrl { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}