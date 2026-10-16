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

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;

    public bool IsMobileClient { get; set; } = false;

    public string? UserAgent { get; set; }

    public string? OperatingSystem { get; set; }
}

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;

    public bool IsMobileClient { get; set; } = false;
}

public class AuthResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? UserId { get; set; }

    public string? FullName { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Token { get; set; }

    // Diisi saat akun terkunci (HTTP 429 di controller)
    public bool IsLockedOut { get; set; }

    public DateTime? LockoutEnd { get; set; }
}

public class UserSessionDto
{
    public Guid Id { get; set; }

    public string DeviceName { get; set; } = string.Empty;

    public string OperatingSystem { get; set; } = string.Empty;

    public string Browser { get; set; } = string.Empty;

    public string UserAgent { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public string Country { get; set; } = "ID";

    public bool IsCurrent { get; set; }

    public DateTime LastActivityAt { get; set; }
}

public class LoginActivityDto
{
    public Guid Id { get; set; }

    public string ActivityType { get; set; } = string.Empty;

    public string Device { get; set; } = string.Empty;

    public string OperatingSystem { get; set; } = string.Empty;

    public string UserAgent { get; set; } = string.Empty;

    public string Browser { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public string Country { get; set; } = "ID";

    public bool IsSuccess { get; set; }

    public DateTime CreatedAt { get; set; }
}
