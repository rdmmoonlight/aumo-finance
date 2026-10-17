// <copyright file="ISettingsService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Settings
{
    using System.Security.Claims;
    using AumoBackend.DTOs;
    /// <summary>
    /// Layanan logika bisnis untuk I Settings Service.
    /// </summary>

    public interface ISettingsService
    {
        /// <summary>
        /// Memperbarui data  Profile Async.
        /// </summary>
        Task<ServiceResult> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileRequest request);
        /// <summary>
        /// Mewakili Upload Avatar Async.
        /// </summary>

        Task<ServiceResult> UploadAvatarAsync(ClaimsPrincipal userPrincipal, IFormFile? file, IFormFile? avatar, IFormFileCollection? files);
        /// <summary>
        /// Mewakili Change Password Async.
        /// </summary>

        Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordRequest request);
        /// <summary>
        /// Menghapus data  Account Async.
        /// </summary>

        Task<ServiceResult> DeleteAccountAsync(ClaimsPrincipal userPrincipal);
        /// <summary>
        /// Mengambil data  Guardian Dashboard Async.
        /// </summary>

        Task<ServiceResult> GetGuardianDashboardAsync(ClaimsPrincipal userPrincipal);
        /// <summary>
        /// Mewakili Revoke Session Async.
        /// </summary>

        Task<ServiceResult> RevokeSessionAsync(ClaimsPrincipal userPrincipal, Guid sessionId);
        /// <summary>
        /// Mewakili Revoke All Sessions Async.
        /// </summary>

        Task<ServiceResult> RevokeAllSessionsAsync(ClaimsPrincipal userPrincipal);
    }
}
