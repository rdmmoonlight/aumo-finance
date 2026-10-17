// <copyright file="SettingsDto.cs" company="PlaceholderCompany">
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
/// Model data Update Profile Request.
/// </summary>

public class UpdateProfileRequest
{
    /// <summary>
    /// Mewakili Full Name.
    /// </summary>
    public string? FullName { get; set; }
/// <summary>
/// Mewakili User Name.
/// </summary>

    public string? UserName { get; set; }
/// <summary>
/// Mewakili Phone Number.
/// </summary>

    public string? PhoneNumber { get; set; }
/// <summary>
/// Mewakili Bio.
/// </summary>

    public string? Bio { get; set; }
/// <summary>
/// Mewakili Avatar Url.
/// </summary>

    public string? AvatarUrl { get; set; }
}
/// <summary>
/// Model data Change Password Request.
/// </summary>

public class ChangePasswordRequest
{
    /// <summary>
    /// Mewakili Current Password.
    /// </summary>
    public string CurrentPassword { get; set; } = string.Empty;
/// <summary>
/// Mewakili New Password.
/// </summary>

    public string NewPassword { get; set; } = string.Empty;
}
/// <summary>
/// Mewakili Service Result.
/// </summary>

public class ServiceResult
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
/// Mewakili Data.
/// </summary>

    public object? Data { get; set; }
/// <summary>
/// Mewakili Status Code.
/// </summary>

    public int StatusCode { get; set; } = 200;
/// <summary>
/// Mewakili Ok.
/// </summary>

    public static ServiceResult Ok(string message = "", object? data = null) =>
        new() { Success = true, Message = message, Data = data, StatusCode = 200 };
/// <summary>
/// Model data Bad Request.
/// </summary>

    public static ServiceResult BadRequest(string message) =>
        new() { Success = false, Message = message, StatusCode = 400 };
/// <summary>
/// Mewakili Unauthorized.
/// </summary>

    public static ServiceResult Unauthorized(string message = "Unauthorized access.") =>
        new() { Success = false, Message = message, StatusCode = 401 };
/// <summary>
/// Mewakili Internal Server Error.
/// </summary>

    public static ServiceResult InternalServerError(string message) =>
        new() { Success = false, Message = message, StatusCode = 500 };
}
