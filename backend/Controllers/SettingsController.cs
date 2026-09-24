using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AumoBackend.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AumoBackend.Controllers
{
    [ApiController]
    [Route("/api/v1/settings")]
    [Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
    public class SettingsController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IGuardianService _guardianService;

        public SettingsController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IGuardianService guardianService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _guardianService = guardianService;
        }

        #region Profile Settings

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Update Username (jika berubah)
            if (!string.IsNullOrWhiteSpace(request.UserName) && request.UserName != user.UserName)
            {
                var setUserNameResult = await _userManager.SetUserNameAsync(user, request.UserName);
                if (!setUserNameResult.Succeeded)
                {
                    var errors = string.Join(", ", setUserNameResult.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = errors });
                }
            }

            // Update Phone Number (jika berubah)
            if (request.PhoneNumber != user.PhoneNumber)
            {
                var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
                if (!setPhoneResult.Succeeded)
                {
                    var errors = string.Join(", ", setPhoneResult.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = errors });
                }
            }

            // Update Custom Fields pada ApplicationUser (FullName, Bio, AvatarUrl)
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
                return BadRequest(new { success = false, message = errors });
            }

            return Ok(new { success = true, message = "Profile updated successfully." });
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar([FromForm] IFormFile file)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "No file uploaded." });
            }

            // Validasi format file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { success = false, message = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." });
            }

            // Simpan file ke direktori wwwroot/uploads/avatars
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{user.Id}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeAvatarUrl = $"/uploads/avatars/{fileName}";
            user.AvatarUrl = relativeAvatarUrl;
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                success = true,
                message = "Avatar uploaded successfully.",
                avatarUrl = relativeAvatarUrl
            });
        }

        #endregion

        #region Security & Password Settings

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { success = false, message = errors });
            }

            return Ok(new { success = true, message = "Password successfully updated." });
        }

        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            await _guardianService.RevokeAllSessionsAsync(user.Id);

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { success = false, message = errors });
            }

            await _signInManager.SignOutAsync();
            return Ok(new { success = true, message = "Account successfully deleted." });
        }

        #endregion

        #region Guardian Dashboard & Sessions

        [HttpGet("guardian/dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

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

            return Ok(new { success = true, data = dashboard });
        }

        [HttpPost("guardian/revoke-session/{sessionId}")]
        public async Task<IActionResult> RevokeSession(Guid sessionId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            await _guardianService.RevokeSessionAsync(sessionId, user.Id);
            return Ok(new { success = true, message = "Session revoked." });
        }

        [HttpPost("guardian/revoke-all-sessions")]
        public async Task<IActionResult> RevokeAllSessions()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            await _guardianService.RevokeAllSessionsAsync(user.Id);
            return Ok(new { success = true, message = "All other sessions revoked." });
        }
    }
}
