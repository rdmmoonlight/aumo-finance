// <copyright file="HealthService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Health
{
    using AumoBackend.DTOs;

    public class HealthService : IHealthService
    {
        /// <inheritdoc/>
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
