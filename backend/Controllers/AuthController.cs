using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Validators.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/auth")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
[EnableRateLimiting("auth-strict")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(IAuthService authService, SignInManager<ApplicationUser> signInManager)
    {
        _authService = authService;
        _signInManager = signInManager;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var validation = await _authService.ValidateLoginAsync(request);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToErrorResponse());
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var headerUserAgent = Request.Headers["User-Agent"].ToString();

        var result = await _authService.ProcessLoginAsync(request, ip, headerUserAgent);

        if (result == null)
        {
            return Unauthorized(new { success = false, message = "Invalid email/username or password." });
        }

        if (result.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                success = false,
                message = result.Message,
                lockoutEnd = result.LockoutEnd
            });
        }

        if (request.IsMobileClient)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                userId = result.UserId,
                fullName = result.FullName,
                avatarUrl = result.AvatarUrl,
                token = result.Token
            });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            userId = result.UserId,
            fullName = result.FullName,
            avatarUrl = result.AvatarUrl
        });
    }

    /// <summary>
    /// Google OAuth Login via POST (Web via Cookie & Mobile via JWT dari SDK Frontend)
    /// </summary>
    [HttpPost("google-login")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        var validation = await _authService.ValidateGoogleLoginAsync(request);
        if (!validation.IsValid)
        {
            return BadRequest(validation.ToErrorResponse());
        }

        var result = await _authService.ProcessGoogleLoginAsync(request);

        if (result == null)
        {
            return Unauthorized(new { success = false, message = "Invalid Google ID Token or account could not be created." });
        }

        if (request.IsMobileClient)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                userId = result.UserId,
                fullName = result.FullName,
                avatarUrl = result.AvatarUrl,
                token = result.Token
            });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            userId = result.UserId,
            fullName = result.FullName,
            avatarUrl = result.AvatarUrl
        });
    }

    /// <summary>
    /// Google OAuth Login via GET Redirect (Server-Initiated OAuth).
    /// Menangani browser direct navigation via window.location.href tanpa memicu HTTP 405.
    /// </summary>
    [HttpGet("google-login")]
    [AllowAnonymous]
    public IActionResult GoogleLoginRedirect(string redirectTo = "/home")
    {
        // Validasi URL awal sebelum dilewatkan ke Google Challenge
        var safeRedirectUrl = GetSafeRedirectUrl(redirectTo);

        var redirectUrl = Url.Action(nameof(GoogleCallback), new { redirectTo = safeRedirectUrl });
        var properties = _authService.ConfigureGoogleRedirectProperties(redirectUrl!);

        return Challenge(properties, "Google");
    }

    /// <summary>
    /// Callback handler setelah autentikasi OAuth Google eksternal berhasil
    /// </summary>
    [HttpGet("google-callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback(string redirectTo = "/home", string? remoteError = null)
    {
        if (remoteError != null)
        {
            return BadRequest(new { success = false, message = $"Error from external provider: {remoteError}" });
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            return BadRequest(new { success = false, message = "Error loading external login information." });
        }

        var error = await _authService.ProcessGoogleCallbackAsync(info.Principal, info.LoginProvider, info.ProviderKey);
        if (error != null)
        {
            return BadRequest(new { success = false, message = error });
        }

        // Validasi ulang URL sebelum eksekusi Redirect (cegah open redirect)
        return Redirect(GetSafeRedirectUrl(redirectTo));
    }

    /// <summary>
    /// Endpoint untuk mendapatkan profil user aktif secara realtime
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _authService.GetUserProfileAsync(User);

        if (profile == null)
        {
            return Unauthorized(new { success = false, message = "User session expired or user not found." });
        }

        var profileData = new
        {
            id = profile.Id,
            userId = profile.UserId,
            email = profile.Email,
            userName = profile.UserName,
            fullName = profile.FullName,
            phoneNumber = profile.PhoneNumber,
            avatarUrl = profile.AvatarUrl,
            bio = profile.Bio,
            roles = profile.Roles,
            customClaims = profile.CustomClaims
        };

        return Ok(new
        {
            success = true,
            data = profileData,
            id = profile.Id,
            userId = profile.UserId,
            email = profile.Email,
            userName = profile.UserName,
            fullName = profile.FullName,
            phoneNumber = profile.PhoneNumber,
            avatarUrl = profile.AvatarUrl,
            bio = profile.Bio,
            roles = profile.Roles,
            customClaims = profile.CustomClaims
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync();
        return Ok(new { success = true, message = "Logged out successfully." });
    }

    /// <summary>
    /// Hanya mengizinkan path lokal atau origin frontend yang terdaftar (AllowedOrigins).
    /// Selain itu kembali ke /home untuk mencegah open redirect.
    /// </summary>
    private string GetSafeRedirectUrl(string? targetUrl)
    {
        const string defaultUrl = "/home";

        if (string.IsNullOrWhiteSpace(targetUrl))
            return defaultUrl;

        if (Url.IsLocalUrl(targetUrl))
            return targetUrl;

        if (Uri.TryCreate(targetUrl, UriKind.Absolute, out var uri) && AllowedOrigins.IsAllowed(uri))
            return targetUrl;

        return defaultUrl;
    }
}
