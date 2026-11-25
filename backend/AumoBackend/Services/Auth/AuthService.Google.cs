namespace AumoBackend.Services.Auth;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;

public partial class AuthService
{
    public async Task<AuthResponseDto?> ProcessGoogleLoginAsync(GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return null;
        }

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
        var user = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        if (user == null)
        {
            user = await userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = payload.Email,
                    Email = payload.Email,
                    EmailConfirmed = true,
                    FullName = payload.Name,
                    AvatarUrl = payload.Picture,
                };

                var createResult = await userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return null;
                }

                await userManager.AddToRoleAsync(user, "User");
            }

            await userManager.AddLoginAsync(user, info);
        }

        if (!request.RequiresJwtToken)
        {
            await signInManager.SignInAsync(user, isPersistent: true);
            return new AuthResponseDto
            {
                Success = true,
                Message = "Google login successful (Cookie session established).",
                UserId = user.Id.ToString(),
                FullName = user.FullName ?? user.UserName ?? "User",
                AvatarUrl = user.AvatarUrl,
            };
        }

        var token = await this.GenerateJwtTokenAsync(user);
        var clientType = request.IsMobileClient ? "Mobile" : "Desktop";

        return new AuthResponseDto
        {
            Success = true,
            Message = $"Google {clientType} login successful.",
            UserId = user.Id.ToString(),
            FullName = user.FullName ?? user.UserName ?? "User",
            AvatarUrl = user.AvatarUrl,
            Token = token,
        };
    }

    public AuthenticationProperties ConfigureGoogleRedirectProperties(string redirectUrl)
    {
        return signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
    }

    public async Task<string?> HandleGoogleCallbackAsync()
    {
        var info = await signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            return "Error loading external login information.";
        }

        return await this.ProcessGoogleCallbackAsync(info.Principal, info.LoginProvider, info.ProviderKey);
    }

    public async Task<string?> ProcessGoogleCallbackAsync(ClaimsPrincipal principal, string loginProvider, string providerKey)
    {
        var result = await signInManager.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent: true, bypassTwoFactor: true);

        if (result.Succeeded)
        {
            return null;
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return "Email claim not received from Google.";
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = principal.FindFirstValue(ClaimTypes.Name) ?? email,
                AvatarUrl = principal.FindFirstValue("picture"),
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return "Failed to create user from Google callback.";
            }

            await userManager.AddToRoleAsync(user, "User");
        }

        await userManager.AddLoginAsync(user, new UserLoginInfo(loginProvider, providerKey, loginProvider));
        await signInManager.SignInAsync(user, isPersistent: true);

        return null;
    }
}
