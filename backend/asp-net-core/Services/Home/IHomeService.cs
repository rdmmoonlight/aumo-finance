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
    /// <summary>
    /// Mengambil data  Market Indicators Async.
    /// </summary>
    Task<List<MarketIndicatorDto>> GetMarketIndicatorsAsync();
}