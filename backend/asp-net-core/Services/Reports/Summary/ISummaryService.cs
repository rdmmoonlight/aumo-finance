// <copyright file="ISummaryService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Reports.Summary;

using System.Security.Claims;
using AumoBackend.DTOs;

public interface ISummaryService
{
    Task<SummaryDto?> GetSummaryAsync(ClaimsPrincipal userPrincipal);
}
