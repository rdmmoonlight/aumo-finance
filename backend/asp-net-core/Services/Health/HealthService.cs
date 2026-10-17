// <copyright file="HealthService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Health
{
    using AumoBackend.DTOs;
/// <summary>
/// Layanan logika bisnis untuk Health Service.
/// </summary>

    public class HealthService : IHealthService
    {
        /// <summary>
        /// Mengambil data  Health Status Async.
        /// </summary>
        public Task<HealthStatusDto> GetHealthStatusAsync()
        {
            return Task.FromResult(new HealthStatusDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
            });
        }
    }
}
