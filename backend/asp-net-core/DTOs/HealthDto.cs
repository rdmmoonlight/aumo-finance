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

public class HealthStatusDto
{
    public string Status { get; set; } = string.Empty;

    public string Database { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }

    public string? Message { get; set; }
}
