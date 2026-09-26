using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AumoBackend.Core;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AumoBackend.Controllers;

[ApiController]
[Route("/api/v1/auth")]
[Authorize(AuthenticationSchemes = "Identity.Application,Bearer")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IGuardianService _guardianService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IGuardianService guardianService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _guardianService = guardianService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Email and password are required." });
        }

        var user = await _userManager.FindByEmailAsync(request.Email)
                   ?? await _userManager.FindByNameAsync(request.Email);

        if (user == null)
        {
            return Unauthorized(new { success = false, message = "Invalid email/username or password." });
        }

        var headerUserAgent = Request.Headers["User-Agent"].ToString();
        var safeUserAgent = !string.IsNullOrWhiteSpace(request.UserAgent)
            ? request.UserAgent
            : (!string.IsNullOrWhiteSpace(headerUserAgent) ? headerUserAgent : "Aumo Client");

        var isMobile = request.IsMobileClient;

        string deviceCategory = isMobile ? "Mobile" : "Web";
        string ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        string osValue = !string.IsNullOrWhiteSpace(request.OperatingSystem) ? request.OperatingSystem : deviceCategory;

        // 1. CEK UNTUK AKUN YANG SUDAH TERKUNCI SEBELUMNYA
        if (await _userManager.IsLockedOutAsync(user))
        {
            var lockoutEndDate = await _userManager.GetLockoutEndDateAsync(user);
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                success = false,
                message = "Account is locked due to multiple failed login attempts.",
                lockoutEnd = lockoutEndDate?.UtcDateTime
            });
        }

        // 2. VALIDASI PASSWORD DENGAN MEMPERHITUNGKAN UNTUK LOCKOUT
        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            var lockoutEndDate = await _userManager.GetLockoutEndDateAsync(user);

            await _guardianService.CreateLoginActivityAsync(
                user.Id,
                "Locked Out Login Attempt",
                deviceCategory,
                isMobile ? "Mobile App" : "Web Browser",
                ip,
                "ID",
                false,
                operatingSystem: osValue,
                userAgent: safeUserAgent
            );

            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                success = false,
                message = "Account is locked due to multiple failed login attempts.",
                lockoutEnd = lockoutEndDate?.UtcDateTime
            });
        }

        if (!signInResult.Succeeded)
        {
            await _guardianService.CreateLoginActivityAsync(
                user.Id,
                "Failed Login",
                deviceCategory,
                isMobile ? "Mobile App" : "Web Browser",
                ip,
                "ID",
                false,
                operatingSystem: osValue,
                userAgent: safeUserAgent
            );

            return Unauthorized(new { success = false, message = "Invalid email/username or password." });
        }

        // =====================================
        // PEMISAHAN MEKANISME: COOKIE VS JWT
        // =====================================
        string? jwtToken = null;

        if (!isMobile)
        {
            // --- WEB FLOW: Hanya buat Cookie Session ---
            await _signInManager.SignInAsync(user, isPersistent: request.RememberMe);
        }
        else
        {
            // --- MOBILE FLOW: Hanya buat JWT Token ---
            jwtToken = await GenerateJwtTokenAsync(user);
        }

        // Reset hitungan percobaan gagal setelah login berhasil
        await _userManager.ResetAccessFailedCountAsync(user);

        // Audit Log & Guardian Session
        await _guardianService.CreateSessionAsync(
            user.Id,
            deviceName: deviceCategory,
            operatingSystem: osValue,
            browser: isMobile ? "Mobile App" : "Web Browser",
            ipAddress: ip,
            country: "ID",
            refreshTokenHash: isMobile ? "JWT_BEARER" : "COOKIE_SESSION",
            userAgent: safeUserAgent
        );

        await _guardianService.CreateLoginActivityAsync(
            user.Id,
            "Interactive Login",
            deviceCategory,
            isMobile ? "Mobile App" : "Web Browser",
            ip,
            "ID",
            true,
            operatingSystem: osValue,
            userAgent: safeUserAgent
        );

        if (isMobile)
        {
            return Ok(new
            {
                success = true,
                message = "Mobile login successful.",
                userId = user.Id.ToString(),
                fullName = user.FullName ?? user.UserName ?? "User",
                avatarUrl = user.AvatarUrl,
                token = jwtToken
            });
        }

        return Ok(new
        {
            success = true,
            message = "Web login successful.",
            userId = user.Id.ToString(),
            fullName = user.FullName ?? user.UserName ?? "User",
            avatarUrl = user.AvatarUrl
        });
    }

    /// <summary>
    /// Google OAuth Login (Mendukung Web via Cookie & Mobile via JWT)
    /// </summary>
    [HttpPost("google-login")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(new { success = false, message = "Google ID Token is required." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
        }
        catch (Exception)
        {
            return Unauthorized(new { success = false, message = "Invalid Google ID Token." });
        }

        var info = new UserLoginInfo("Google", payload.Subject, "Google");
        var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        if (user == null)
        {
            user = await _userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = payload.Email,
                    Email = payload.Email,
                    EmailConfirmed = true,
                    FullName = payload.Name,
                    AvatarUrl = payload.Picture
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { success = false, message = "Failed to create user from Google account." });
                }

                await _userManager.AddToRoleAsync(user, "User");
            }

            await _userManager.AddLoginAsync(user, info);
        }

        if (!request.IsMobileClient)
        {
            await _signInManager.SignInAsync(user, isPersistent: true);
            return Ok(new
            {
                success = true,
                message = "Google login successful (Cookie session established).",
                userId = user.Id.ToString(),
                fullName = user.FullName ?? user.UserName ?? "User",
                avatarUrl = user.AvatarUrl
            });
        }

        var token = await GenerateJwtTokenAsync(user);
        return Ok(new
        {
            success = true,
            message = "Google login successful.",
            userId = user.Id.ToString(),
            fullName = user.FullName ?? user.UserName ?? "User",
            avatarUrl = user.AvatarUrl,
            token = token
        });
    }

    /// <summary>
    /// Endpoint untuk mendapatkan profil user aktif secara realtime
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        // 1. Ambil dari Cookie/Claims Principal
        var user = await _userManager.GetUserAsync(User);

        // Fallback: Jika null, cari via Claim NameIdentifier / Sub (terutama untuk JWT Bearer)
        if (user == null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                         ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (!string.IsNullOrEmpty(userId))
            {
                user = await _userManager.FindByIdAsync(userId);
            }
        }

        if (user == null)
        {
            return Unauthorized(new { success = false, message = "User session expired or user not found." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userClaims = await _userManager.GetClaimsAsync(user);

        var profileData = new
        {
            id = user.Id,
            userId = user.Id,
            email = user.Email,
            userName = user.UserName,
            fullName = user.FullName,
            phoneNumber = user.PhoneNumber,
            avatarUrl = user.AvatarUrl,
            bio = user.Bio,
            roles = roles,
            customClaims = userClaims
        };

        // Mereturn ganda (data wrapper & flat) agar kompatibel dengan (me as any)?.data maupun me
        return Ok(new
        {
            success = true,
            data = profileData,
            id = user.Id,
            userId = user.Id,
            email = user.Email,
            userName = user.UserName,
            fullName = user.FullName,
            phoneNumber = user.PhoneNumber,
            avatarUrl = user.AvatarUrl,
            bio = user.Bio,
            roles = roles,
            customClaims = userClaims
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { success = true, message = "Logged out successfully." });
    }

    /// <summary>
    /// Generate JWT Token async yang memuat data User, Roles, dan Claims.
    /// </summary>
    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var jwtSigningKey = _configuration["JWT_SIGNING_KEY"]
            ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
            ?? throw new InvalidOperationException("JWT_SIGNING_KEY is missing.");

        var jwtIssuer = _configuration["JWT_ISSUER"]
            ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
            ?? "AumoFinanceApp";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName ?? user.UserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var userClaims = await _userManager.GetClaimsAsync(user);
        claims.AddRange(userClaims);

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
