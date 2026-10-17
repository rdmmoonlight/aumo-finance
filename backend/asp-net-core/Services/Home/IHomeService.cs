// <copyright file="IHomeService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Home;

using AumoBackend.DTOs.Home;

/// <summary>
/// Layanan logika bisnis untuk I Home Service.
/// </summary>
public interface IHomeService
{
    Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync();
}