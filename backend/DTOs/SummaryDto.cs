// <copyright file="SummaryDto.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.DTOs;

using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;

public class SummaryDto
{
    public Guid? SelectedPeriodId { get; set; }

    public int TotalJournal { get; set; }

    public int ActiveCoa { get; set; }

    public string ActivePeriodName { get; set; } = string.Empty;

    public bool IsPeriodOpen { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public string? Message { get; set; }

    public T? Data { get; set; }
}
