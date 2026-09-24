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
        // Menggunakan CheckPasswordSignInAsync agar AccessFailedCount bertambah & lockout dipicu otomatis oleh ASP.NET Identity
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
            // --- MOBILE FLOW: Hanya buat JWT Token (TIDAK buat Cookie) ---
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

        // Web mendapat JSON tanpa Token (murni Cookie), Mobile mendapat JSON berisi Token JWT
        if (isMobile)
        {
            return Ok(new
            {
                success = true,
                message = "Mobile login successful.",
                userId = user.Id.ToString(),
                fullName = user.FullName ?? user.UserName ?? "User",
                token = jwtToken
            });
        }

        return Ok(new
        {
            success = true,
            message = "Web login successful.",
            userId = user.Id.ToString(),
            fullName = user.FullName ?? user.UserName ?? "User"
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
                    FullName = payload.Name
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { success = false, message = "Failed to create user from Google account." });
                }

                await _userManager.AddToRoleAsync(user, "User");
            }

            // Simpan relasi Google Login ke tabel AspNetUserLogins
            await _userManager.AddLoginAsync(user, info);
        }

        if (!request.IsMobileClient)
        {
            // Web: Issue Cookie
            await _signInManager.SignInAsync(user, isPersistent: true);
            return Ok(new
            {
                success = true,
                message = "Google login successful (Cookie session established).",
                userId = user.Id.ToString(),
                fullName = user.FullName ?? user.UserName ?? "User"
            });
        }

        // Mobile: Issue JWT Token
        var token = await GenerateJwtTokenAsync(user);
        return Ok(new
        {
            success = true,
            message = "Google login successful.",
            userId = user.Id.ToString(),
            fullName = user.FullName ?? user.UserName ?? "User",
            token = token
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return NotFound(new { success = false, message = "User session active, but user not found." });

        var roles = await _userManager.GetRolesAsync(user);
        var userClaims = await _userManager.GetClaimsAsync(user);

        return Ok(new
        {
            success = true,
            userId = user.Id,
            email = user.Email,
            userName = user.UserName,
            fullName = user.FullName ?? user.UserName,
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
    /// Generate JWT Token async yang memuat data User, Roles (AspNetUserRoles), dan Claims (AspNetUserClaims).
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

        // Memasukkan Roles ke JWT (AspNetUserRoles)
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Memasukkan Custom User Claims ke JWT (AspNetUserClaims)
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
