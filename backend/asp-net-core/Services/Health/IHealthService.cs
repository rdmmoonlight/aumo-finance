// <copyright file="IHealthService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Health
{
    using AumoBackend.DTOs;
/// <summary>
/// Layanan logika bisnis untuk I Health Service.
/// </summary>

    public interface IHealthService
    {
        /// <summary>
        /// Mengambil data  Health Status Async.
        /// </summary>
        Task<HealthStatusDto> GetHealthStatusAsync();
    }
}