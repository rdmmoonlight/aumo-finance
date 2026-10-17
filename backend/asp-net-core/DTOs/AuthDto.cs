// <copyright file="AuthDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs;

using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Model data Login Request.
/// </summary>

public class LoginRequest
{
    /// <summary>
    /// Mewakili Email.
    /// </summary>
    public string Email { get; set; } = string.Empty;
/// <summary>
/// Mewakili Password.
/// </summary>

    public string Password { get; set; } = string.Empty;
/// <summary>
/// Mewakili Remember Me.
/// </summary>

    public bool RememberMe { get; set; }
/// <summary>
/// Mewakili Is Mobile Client.
/// </summary>

    public bool IsMobileClient { get; set; }
/// <summary>
/// Mewakili User Agent.
/// </summary>

    public string? UserAgent { get; set; }
/// <summary>
/// Mewakili Operating System.
/// </summary>

    public string? OperatingSystem { get; set; }
}
/// <summary>
/// Model data Google Login Request.
/// </summary>

public class GoogleLoginRequest
{
    /// <summary>
    /// Mewakili Id Token.
    /// </summary>
    public string IdToken { get; set; } = string.Empty;
/// <summary>
/// Mewakili Is Mobile Client.
/// </summary>

    public bool IsMobileClient { get; set; }
}
/// <summary>
/// Model data Auth Response Dto.
/// </summary>

public class AuthResponseDto
{
    /// <summary>
    /// Mewakili Success.
    /// </summary>
    public bool Success { get; set; }
/// <summary>
/// Mewakili Message.
/// </summary>

    public string Message { get; set; } = string.Empty;
/// <summary>
/// Mewakili User Id.
/// </summary>

    public string? UserId { get; set; }
/// <summary>
/// Mewakili Full Name.
/// </summary>

    public string? FullName { get; set; }
/// <summary>
/// Mewakili Avatar Url.
/// </summary>

    public string? AvatarUrl { get; set; }
/// <summary>
/// Mewakili Token.
/// </summary>

    public string? Token { get; set; }
/// <summary>
/// Mewakili Is Locked Out.
/// </summary>

    // Diisi saat akun terkunci (HTTP 429 di controller)
    public bool IsLockedOut { get; set; }
/// <summary>
/// Mewakili Lockout End.
/// </summary>

    public DateTime? LockoutEnd { get; set; }
}
/// <summary>
/// Model data User Session Dto.
/// </summary>

public class UserSessionDto
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public Guid Id { get; set; }
/// <summary>
/// Mewakili Device Name.
/// </summary>

    public string DeviceName { get; set; } = string.Empty;
/// <summary>
/// Mewakili Operating System.
/// </summary>

    public string OperatingSystem { get; set; } = string.Empty;
/// <summary>
/// Mewakili Browser.
/// </summary>

    public string Browser { get; set; } = string.Empty;
/// <summary>
/// Mewakili User Agent.
/// </summary>

    public string UserAgent { get; set; } = string.Empty;
/// <summary>
/// Mewakili Ip Address.
/// </summary>

    public string IpAddress { get; set; } = string.Empty;
/// <summary>
/// Mewakili Country.
/// </summary>

    public string Country { get; set; } = "ID";
/// <summary>
/// Mewakili Is Current.
/// </summary>

    public bool IsCurrent { get; set; }
/// <summary>
/// Mewakili Last Activity At.
/// </summary>

    public DateTime LastActivityAt { get; set; }
}
/// <summary>
/// Model data Login Activity Dto.
/// </summary>

public class LoginActivityDto
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public Guid Id { get; set; }
/// <summary>
/// Mewakili Activity Type.
/// </summary>

    public string ActivityType { get; set; } = string.Empty;
/// <summary>
/// Mewakili Device.
/// </summary>

    public string Device { get; set; } = string.Empty;
/// <summary>
/// Mewakili Operating System.
/// </summary>

    public string OperatingSystem { get; set; } = string.Empty;
/// <summary>
/// Mewakili User Agent.
/// </summary>

    public string UserAgent { get; set; } = string.Empty;
/// <summary>
/// Mewakili Browser.
/// </summary>

    public string Browser { get; set; } = string.Empty;
/// <summary>
/// Mewakili Ip Address.
/// </summary>

    public string IpAddress { get; set; } = string.Empty;
/// <summary>
/// Mewakili Country.
/// </summary>

    public string Country { get; set; } = "ID";
/// <summary>
/// Mewakili Is Success.
/// </summary>

    public bool IsSuccess { get; set; }
/// <summary>
/// Membuat data d At baru.
/// </summary>

    public DateTime CreatedAt { get; set; }
}
