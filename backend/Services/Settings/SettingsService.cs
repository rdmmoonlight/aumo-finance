using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Supabase;

namespace AumoBackend.Services.Settings
{

    public class SettingsService : ISettingsService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IGuardianService _guardianService;
        private readonly Client? _supabaseClient;
        private const string BucketName = "aumo-storage";

        public SettingsService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IGuardianService guardianService,
            Client? supabaseClient = null)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _guardianService = guardianService;
            _supabaseClient = supabaseClient;
        }

        public async Task<ServiceResult> UpdateProfileAsync(ClaimsPrincipal userPrincipal, UpdateProfileRequest request)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            if (!string.IsNullOrWhiteSpace(request.UserName) && request.UserName != user.UserName)
            {
                var setUserNameResult = await _userManager.SetUserNameAsync(user, request.UserName);
                if (!setUserNameResult.Succeeded)
                {
                    var errors = string.Join(", ", setUserNameResult.Errors.Select(e => e.Description));
                    return ServiceResult.BadRequest(errors);
                }
            }

            if (request.PhoneNumber != user.PhoneNumber)
            {
                var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
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

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                return ServiceResult.BadRequest(errors);
            }

            return ServiceResult.Ok("Profile updated successfully.");
        }

        public async Task<ServiceResult> UploadAvatarAsync(ClaimsPrincipal userPrincipal, IFormFile? file, IFormFile? avatar, IFormFileCollection? files)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            var uploadFile = file ?? avatar ?? files?.FirstOrDefault();
            if (uploadFile == null || uploadFile.Length == 0)
            {
                return ServiceResult.BadRequest("No file uploaded. Ensure the form-data key is named 'file' or 'avatar'.");
            }

            if (uploadFile.Length > 2 * 1024 * 1024)
            {
                return ServiceResult.BadRequest("File size exceeds limit (Max 2MB).");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(uploadFile.FileName);

            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Any(e => e.Equals(extension, StringComparison.OrdinalIgnoreCase)))
            {
                return ServiceResult.BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");
            }

            if (_supabaseClient == null)
            {
                return ServiceResult.InternalServerError("Supabase Client is not configured on the server.");
            }

            try
            {
                var fileName = $"avatar_{user.Id}_{Guid.NewGuid()}{extension.ToLowerInvariant()}";

                using var memoryStream = new MemoryStream();
                await uploadFile.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();

                var storage = _supabaseClient.Storage.From(BucketName);
                await storage.Upload(fileBytes, fileName, new Supabase.Storage.FileOptions
                {
                    ContentType = uploadFile.ContentType,
                    Upsert = true
                });

                var publicUrl = storage.GetPublicUrl(fileName);

                user.AvatarUrl = publicUrl;
                await _userManager.UpdateAsync(user);

                return ServiceResult.Ok("Avatar uploaded successfully to Supabase.", new { avatarUrl = publicUrl });
            }
            catch (Exception ex)
            {
                return ServiceResult.InternalServerError($"Supabase upload error: {ex.Message}");
            }
        }

        public async Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal userPrincipal, ChangePasswordRequest request)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ServiceResult.BadRequest(errors);
            }

            return ServiceResult.Ok("Password successfully updated.");
        }

        public async Task<ServiceResult> DeleteAccountAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            await _guardianService.RevokeAllSessionsAsync(user.Id);

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ServiceResult.BadRequest(errors);
            }

            await _signInManager.SignOutAsync();
            return ServiceResult.Ok("Account successfully deleted.");
        }

        public async Task<ServiceResult> GetGuardianDashboardAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            var activeSessions = await _guardianService.GetActiveSessionsAsync(user.Id);
            var loginActivities = await _guardianService.GetLoginActivitiesAsync(user.Id);

            var failedAttempts = loginActivities.Count(a => !a.IsSuccess && a.CreatedAt >= DateTime.UtcNow.AddDays(-1));
            var lastSuccess = loginActivities.FirstOrDefault(a => a.IsSuccess)?.CreatedAt;

            var dashboard = new GuardianDashboardViewModel
            {
                SecurityStatus = new SecurityStatusViewModel
                {
                    StatusLevel = failedAttempts > 3 ? "Warning" : "Good",
                    ActiveSessionsCount = activeSessions.Count,
                    FailedAttemptsLast24Hours = failedAttempts,
                    LastSuccessfulLogin = lastSuccess
                },
                RecentActivities = loginActivities.Select(a => new LoginActivityViewModel
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    Device = a.Device,
                    OperatingSystem = a.OperatingSystem,
                    Browser = a.Browser,
                    IpAddress = a.IpAddress,
                    Country = a.Country,
                    IsSuccess = a.IsSuccess,
                    CreatedAt = a.CreatedAt
                }).ToList(),
                ActiveSessions = activeSessions.Select(s => new ActiveSessionViewModel
                {
                    Id = s.Id,
                    DeviceName = s.DeviceName,
                    OperatingSystem = s.OperatingSystem,
                    Browser = s.Browser,
                    IpAddress = s.IpAddress,
                    Country = s.Country,
                    IsCurrent = s.IsCurrent,
                    LastActivityAt = s.LastActivityAt
                }).ToList()
            };

            return ServiceResult.Ok(data: dashboard);
        }

        public async Task<ServiceResult> RevokeSessionAsync(ClaimsPrincipal userPrincipal, Guid sessionId)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            await _guardianService.RevokeSessionAsync(sessionId, user.Id);
            return ServiceResult.Ok("Session revoked.");
        }

        public async Task<ServiceResult> RevokeAllSessionsAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null) return ServiceResult.Unauthorized();

            await _guardianService.RevokeAllSessionsAsync(user.Id);
            return ServiceResult.Ok("All other sessions revoked.");
        }
    }
}
