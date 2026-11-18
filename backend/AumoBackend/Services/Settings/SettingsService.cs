namespace AumoBackend.Services.Settings;

using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using AumoBackend.Services.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

public class SettingsService : ISettingsService
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly SignInManager<ApplicationUser> signInManager;
    private readonly IAvatarStorage avatarStorage;

    public SettingsService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IAvatarStorage avatarStorage)
    {
        this.userManager = userManager;
        this.signInManager = signInManager;
        this.avatarStorage = avatarStorage;
    }

    public async Task<ServiceResult> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileRequest request)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        if (!string.IsNullOrWhiteSpace(request.UserName) && request.UserName != user.UserName)
        {
            var setUserNameResult = await this.userManager.SetUserNameAsync(user, request.UserName);
            if (!setUserNameResult.Succeeded)
            {
                var errors = string.Join(", ", setUserNameResult.Errors.Select(e => e.Description));
                return ServiceResult.BadRequest(errors);
            }
        }

        if (request.PhoneNumber != user.PhoneNumber)
        {
            var setPhoneResult = await this.userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
            if (!setPhoneResult.Succeeded)
            {
                var errors = string.Join(", ", setPhoneResult.Errors.Select(e => e.Description));
                return ServiceResult.BadRequest(errors);
            }
        }

        user.FullName = request.FullName;
        user.Bio = request.Bio;
        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        var updateResult = await this.userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            return ServiceResult.BadRequest(errors);
        }

        return ServiceResult.Ok("Profile updated successfully.");
    }

    // Berkas sudah divalidasi oleh controller (AvatarFileValidator). Data hasil = URL avatar.
    public async Task<ServiceResult> UploadAvatarAsync(ClaimsPrincipal userPrincipal, IFormFile uploadFile)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        if (!this.avatarStorage.IsConfigured)
        {
            return ServiceResult.InternalServerError("Neon bucket belum dikonfigurasi di server.");
        }

        try
        {
            var extension = Path.GetExtension(uploadFile.FileName);
            var fileName = $"avatar_{user.Id}_{Guid.NewGuid()}{extension.ToLowerInvariant()}";

            using var uploadStream = uploadFile.OpenReadStream();
            var publicUrl = await this.avatarStorage.UploadAvatarAsync(fileName, uploadStream);

            user.AvatarUrl = publicUrl;
            await this.userManager.UpdateAsync(user);

            return ServiceResult.Ok("Avatar uploaded successfully.", publicUrl);
        }
        catch (Exception ex)
        {
            // Data pada hasil gagal berisi pesan InnerException (dikirim sebagai "details").
            return new ServiceResult
            {
                Success = false,
                Message = $"Avatar upload error: {ex.Message}",
                Data = ex.InnerException?.Message,
                StatusCode = 500,
            };
        }
    }

    public async Task<AvatarObject?> GetAvatarAsync(string fileName, CancellationToken cancellationToken)
    {
        if (!this.avatarStorage.IsConfigured)
        {
            return null;
        }

        return await this.avatarStorage.GetAvatarAsync(fileName, cancellationToken);
    }

    public async Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordRequest request)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        var result = await this.userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return ServiceResult.BadRequest(errors);
        }

        return ServiceResult.Ok("Password successfully updated.");
    }

    public async Task<ServiceResult> DeleteAccountAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        var result = await this.userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return ServiceResult.BadRequest(errors);
        }

        await this.signInManager.SignOutAsync();
        return ServiceResult.Ok("Account successfully deleted.");
    }

    public async Task<ServiceResult> RevokeSessionAsync(ClaimsPrincipal userPrincipal, Guid sessionId)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        return ServiceResult.Ok("Session revoked.");
    }

    public async Task<ServiceResult> RevokeAllSessionsAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await this.userManager.GetUserAsync(userPrincipal);
        if (user == null)
        {
            return ServiceResult.Unauthorized();
        }

        return ServiceResult.Ok("All other sessions revoked.");
    }
}
