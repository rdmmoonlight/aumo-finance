// <copyright file="IGuardianService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Settings
{
    using AumoBackend.DTOs;
/// <summary>
/// Layanan logika bisnis untuk I Guardian Service.
/// </summary>

    public interface IGuardianService
    {
        /// <summary>
        /// Mewakili Revoke Session Async.
        /// </summary>
        Task<bool> RevokeSessionAsync(string sessionId);
/// <summary>
/// Mewakili Revoke Session Async.
/// </summary>

        Task<bool> RevokeSessionAsync(string sessionId, string reason);
/// <summary>
/// Mewakili Revoke Session Async.
/// </summary>

        Task<bool> RevokeSessionAsync(Guid sessionId);
/// <summary>
/// Mewakili Revoke Session Async.
/// </summary>

        Task<bool> RevokeSessionAsync(Guid sessionId, string reason);

        Task<bool> RevokeSessionAsync(object a1, object a2 = null!);
/// <summary>
/// Mewakili Revoke All Sessions Async.
/// </summary>

        Task<bool> RevokeAllSessionsAsync(string userId);
/// <summary>
/// Mewakili Revoke All Sessions Async.
/// </summary>

        Task<bool> RevokeAllSessionsAsync(Guid userId);
/// <summary>
/// Mengambil data  Active Sessions Async.
/// </summary>

        Task<List<UserSessionDto>> GetActiveSessionsAsync(string userId);
/// <summary>
/// Mengambil data  Active Sessions Async.
/// </summary>

        Task<List<UserSessionDto>> GetActiveSessionsAsync(Guid userId);
/// <summary>
/// Mengambil data  Login Activities Async.
/// </summary>

        Task<List<LoginActivityDto>> GetLoginActivitiesAsync(string userId);
/// <summary>
/// Mengambil data  Login Activities Async.
/// </summary>

        Task<List<LoginActivityDto>> GetLoginActivitiesAsync(Guid userId);

        Task CreateLoginActivityAsync(string userId, string activity = "", string ipAddress = "", string operatingSystem = "", string browser = "", string userAgent = "", object a7 = null!, object a8 = null!, object a9 = null!);

        Task CreateLoginActivityAsync(Guid userId, string activity = "", string ipAddress = "", string operatingSystem = "", string browser = "", string userAgent = "", object a7 = null!, object a8 = null!, object a9 = null!);

        Task CreateSessionAsync(string userId, string deviceName = "", string operatingSystem = "", string browser = "", string country = "", string ipAddress = "", string userAgent = "", string refreshTokenHash = "", object a9 = null!);

        Task CreateSessionAsync(Guid userId, string deviceName = "", string operatingSystem = "", string browser = "", string country = "", string ipAddress = "", string userAgent = "", string refreshTokenHash = "", object a9 = null!);
    }
}