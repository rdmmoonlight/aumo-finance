using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.DTOs;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AumoBackend.Models;

namespace AumoBackend.Services.Tools;

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
