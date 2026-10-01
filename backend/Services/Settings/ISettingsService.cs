using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using Microsoft.AspNetCore.Http;

namespace AumoBackend.Services.Settings
{

    public interface ISettingsService
    {
        Task<ServiceResult> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileRequest request);
        Task<ServiceResult> UploadAvatarAsync(ClaimsPrincipal userPrincipal, IFormFile? file, IFormFile? avatar, IFormFileCollection? files);
        Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordRequest request);
        Task<ServiceResult> DeleteAccountAsync(ClaimsPrincipal userPrincipal);
        Task<ServiceResult> GetGuardianDashboardAsync(ClaimsPrincipal userPrincipal);
        Task<ServiceResult> RevokeSessionAsync(ClaimsPrincipal userPrincipal, Guid sessionId);
        Task<ServiceResult> RevokeAllSessionsAsync(ClaimsPrincipal userPrincipal);
    }
}
