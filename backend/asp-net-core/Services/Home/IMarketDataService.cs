// <copyright file="IMarketDataService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services
{
    using AumoBackend.DTOs.Home;
/// <summary>
/// Layanan logika bisnis untuk I Market Data Service.
/// </summary>

    public interface IMarketDataService
    {
        /// <summary>
        /// Mengambil data  Market Indicators Async.
        /// </summary>
        Task<IEnumerable<MarketIndicatorDto>> GetMarketIndicatorsAsync();
    }
}
