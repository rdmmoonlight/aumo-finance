// <copyright file="HealthDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs;

using System;
using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;

/// <summary>
/// Model data Health Status Dto.
/// </summary>
public class HealthStatusDto
{
    /// <summary>
    /// Mewakili Status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Database.
    /// </summary>
    public string Database { get; set; } = string.Empty;

    /// <summary>
    /// Mewakili Timestamp.
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Mewakili Message.
    /// </summary>
    public string? Message { get; set; }
}