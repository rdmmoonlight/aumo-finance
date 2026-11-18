namespace AumoBackend.Services.Settings;

using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Services.Storage;
using Microsoft.AspNetCore.Http;

public interface ISettingsService
{
    Task<ServiceResult> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileRequest request);

    Task<ServiceResult> UploadAvatarAsync(ClaimsPrincipal userPrincipal, IFormFile uploadFile);

    Task<AvatarObject?> GetAvatarAsync(string fileName, CancellationToken cancellationToken);

    Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordRequest request);

    Task<ServiceResult> DeleteAccountAsync(ClaimsPrincipal userPrincipal);

    Task<ServiceResult> RevokeSessionAsync(ClaimsPrincipal userPrincipal, Guid sessionId);

    Task<ServiceResult> RevokeAllSessionsAsync(ClaimsPrincipal userPrincipal);
}

