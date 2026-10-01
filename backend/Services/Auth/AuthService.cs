using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using AumoBackend.ViewModels;
using FluentValidation;
using FluentValidation.Results;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AumoBackend.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IGuardianService _guardianService;
    private readonly IConfiguration _configuration;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IGuardianService guardianService,
        IConfiguration configuration,
        IValidator<LoginRequest> loginValidator)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _guardianService = guardianService;
        _configuration = configuration;
        _loginValidator = loginValidator;
    }

    public async Task<ValidationResult> ValidateLoginAsync(LoginRequest request)
    {
        return await _loginValidator.ValidateAsync(request);
    }

    public async Task<AuthResponseDto?> ProcessLoginAsync(LoginRequest request, string ipAddress, string headerUserAgent)
    {
        var user = await _userManager.FindByEmailAsync(request.Email)
                   ?? await _userManager.FindByNameAsync(request.Email);

        if (user == null) return null;

        var safeUserAgent = !string.IsNullOrWhiteSpace(request.UserAgent)
            ? request.UserAgent
            : (!string.IsNullOrWhiteSpace(headerUserAgent) ? headerUserAgent : "Aumo Client");

        var isMobile = request.IsMobileClient;
        string deviceCategory = isMobile ? "Mobile" : "Web";
        string osValue = !string.IsNullOrWhiteSpace(request.OperatingSystem) ? request.OperatingSystem : deviceCategory;

        if (await _userManager.IsLockedOutAsync(user))
        {
            return new AuthResponseDto { Success = false, Message = "LOCKED_OUT" };
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            await _guardianService.CreateLoginActivityAsync(
                user.Id, "Locked Out Login Attempt", deviceCategory,
                isMobile ? "Mobile App" : "Web Browser", ipAddress, "ID", false,
                osValue, safeUserAgent);

            return new AuthResponseDto { Success = false, Message = "LOCKED_OUT" };
        }

        if (!signInResult.Succeeded)
        {
            await _guardianService.CreateLoginActivityAsync(
                user.Id, "Failed Login", deviceCategory,
                isMobile ? "Mobile App" : "Web Browser", ipAddress, "ID", false,
                osValue, safeUserAgent);

            return null;
        }

        string? jwtToken = null;

        if (!isMobile)
        {
            await _signInManager.SignInAsync(user, isPersistent: request.RememberMe);
        }
        else
        {
            jwtToken = await GenerateJwtTokenAsync(user);
        }

        await _userManager.ResetAccessFailedCountAsync(user);

        await _guardianService.CreateSessionAsync(
            user.Id,
            deviceName: deviceCategory,
            osValue,
            isMobile ? "Mobile App" : "Web Browser",
            ipAddress,
            "ID",
            isMobile ? "JWT_BEARER" : "COOKIE_SESSION",
            safeUserAgent
        );

        await _guardianService.CreateLoginActivityAsync(
            user.Id, "Interactive Login", deviceCategory,
            isMobile ? "Mobile App" : "Web Browser", ipAddress, "ID", true,
            osValue, safeUserAgent
        );

        return new AuthResponseDto
        {
            Success = true,
            Message = isMobile ? "Mobile login successful." : "Web login successful.",
            UserId = user.Id.ToString(),
            FullName = user.FullName ?? user.UserName ?? "User",
            AvatarUrl = user.AvatarUrl,
            Token = jwtToken
        };
    }

    public async Task<AuthResponseDto?> ProcessGoogleLoginAsync(GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken)) return null;

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
        }
        catch
        {
            return null;
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
                if (!createResult.Succeeded) return null;

                await _userManager.AddToRoleAsync(user, "User");
            }

            await _userManager.AddLoginAsync(user, info);
        }

        if (!request.IsMobileClient)
        {
            await _signInManager.SignInAsync(user, isPersistent: true);
            return new AuthResponseDto
            {
                Success = true,
                Message = "Google login successful (Cookie session established).",
                UserId = user.Id.ToString(),
                FullName = user.FullName ?? user.UserName ?? "User",
                AvatarUrl = user.AvatarUrl
            };
        }

        var token = await GenerateJwtTokenAsync(user);
        return new AuthResponseDto
        {
            Success = true,
            Message = "Google login successful.",
            UserId = user.Id.ToString(),
            FullName = user.FullName ?? user.UserName ?? "User",
            AvatarUrl = user.AvatarUrl,
            Token = token
        };
    }

    public AuthenticationProperties ConfigureGoogleRedirectProperties(string redirectUrl)
    {
        return _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
    }

    public async Task<string?> ProcessGoogleCallbackAsync(ClaimsPrincipal principal, string loginProvider, string providerKey)
    {
        var result = await _signInManager.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent: true, bypassTwoFactor: true);

        if (result.Succeeded) return null;

        var email = principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return "Email claim not received from Google.";

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = principal.FindFirstValue(ClaimTypes.Name) ?? email,
                AvatarUrl = principal.FindFirstValue("picture")
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded) return "Failed to create user from Google callback.";

            await _userManager.AddToRoleAsync(user, "User");
        }

        await _userManager.AddLoginAsync(user, new UserLoginInfo(loginProvider, providerKey, loginProvider));
        await _signInManager.SignInAsync(user, isPersistent: true);

        return null;
    }

    public async Task<UserProfileViewModel?> GetUserProfileAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await _userManager.GetUserAsync(userPrincipal);

        if (user == null)
        {
            var userId = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? userPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (!string.IsNullOrEmpty(userId))
            {
                user = await _userManager.FindByIdAsync(userId);
            }
        }

        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var userClaims = await _userManager.GetClaimsAsync(user);

        return new UserProfileViewModel
        {
            Id = user.Id,
            UserId = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            Roles = roles,
            CustomClaims = userClaims
        };
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
    }

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
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName ?? user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
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
