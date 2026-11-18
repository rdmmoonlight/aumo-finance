namespace AumoBackend.Controllers;

using AumoBackend.DTOs;
using AumoBackend.Services.Settings;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/settings")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService settingsService;
    private readonly IValidator<ChangePasswordRequest> changePasswordValidator;
    private readonly IValidator<UpdateProfileRequest> updateProfileValidator;
    private readonly IValidator<IFormFile> avatarFileValidator;

    public SettingsController(
        ISettingsService settingsService,
        IValidator<ChangePasswordRequest> changePasswordValidator,
        IValidator<UpdateProfileRequest> updateProfileValidator,
        IValidator<IFormFile> avatarFileValidator)
    {
        this.settingsService = settingsService;
        this.changePasswordValidator = changePasswordValidator;
        this.updateProfileValidator = updateProfileValidator;
        this.avatarFileValidator = avatarFileValidator;
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var validation = await this.updateProfileValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        return this.ToResponse(await this.settingsService.UpdateProfileAsync(this.User, request));
    }

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile? file, [FromForm] IFormFile? avatar)
    {
        // Flexible binding: kunci form boleh "file", "avatar", atau berkas pertama.
        var uploadFile = file ?? avatar ?? (this.Request.Form.Files.Count > 0 ? this.Request.Form.Files[0] : null);

        if (uploadFile == null || uploadFile.Length == 0)
        {
            return this.BadRequest(new { success = false, message = "No file uploaded. Ensure the form-data key is named 'file' or 'avatar'." });
        }

        var fileValidation = await this.avatarFileValidator.ValidateAsync(uploadFile);
        if (!fileValidation.IsValid)
        {
            return this.BadRequest(fileValidation.ToErrorResponse());
        }

        var result = await this.settingsService.UploadAvatarAsync(this.User, uploadFile);

        if (result.Success)
        {
            return this.Ok(new { success = true, message = result.Message, avatarUrl = result.Data });
        }

        // Galat 500 dari proses unggah membawa "details" (pesan InnerException) pada Data.
        return result.StatusCode == StatusCodes.Status500InternalServerError
            ? this.StatusCode(500, new { success = false, message = result.Message, details = result.Data })
            : this.ToResponse(result);
    }

    /// <summary>
    /// Ambil gambar avatar publik berdasarkan nama file.
    /// </summary>
    [HttpGet("avatars/{fileName}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvatar(string fileName, CancellationToken cancellationToken)
    {
        var avatar = await this.settingsService.GetAvatarAsync(fileName, cancellationToken);
        if (avatar == null)
        {
            return this.NotFound();
        }

        this.Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
        this.Response.Headers["X-Content-Type-Options"] = "nosniff";
        return this.File(avatar.Stream, avatar.ContentType);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var validation = await this.changePasswordValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        return this.ToResponse(await this.settingsService.ChangePasswordAsync(this.User, request));
    }

    [HttpDelete("delete-account")]
    public async Task<IActionResult> DeleteAccount()
    {
        return this.ToResponse(await this.settingsService.DeleteAccountAsync(this.User));
    }

    [HttpPost("revoke-session/{sessionId}")]
    public async Task<IActionResult> RevokeSession(Guid sessionId)
    {
        return this.ToResponse(await this.settingsService.RevokeSessionAsync(this.User, sessionId));
    }

    [HttpPost("revoke-all-sessions")]
    public async Task<IActionResult> RevokeAllSessions()
    {
        return this.ToResponse(await this.settingsService.RevokeAllSessionsAsync(this.User));
    }

    // 401 dikirim tanpa isi; status lain memakai bentuk { success, message }.
    private IActionResult ToResponse(ServiceResult result)
    {
        if (result.StatusCode == StatusCodes.Status401Unauthorized)
        {
            return this.Unauthorized();
        }

        var body = new { success = result.Success, message = result.Message };
        return result.Success ? this.Ok(body) : this.StatusCode(result.StatusCode, body);
    }
}
