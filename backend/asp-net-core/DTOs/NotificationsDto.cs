// <copyright file="NotificationsDto.cs" company="PlaceholderCompany">
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
/// Model data Notification Dto.
/// </summary>
public class NotificationDto
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Mewakili Title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Type.
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Is Read.
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Mewakili Target Url.
    /// </summary>
    public string? TargetUrl { get; set; }

    /// <summary>
    /// Membuat data d At baru.
    /// </summary>
    public string CreatedAt { get; set; } = string.Empty;
}