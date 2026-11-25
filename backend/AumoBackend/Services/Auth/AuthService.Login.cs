namespace AumoBackend.Services.Auth;

using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;

public partial class AuthService
{
    public async Task<AuthResponseDto?> ProcessLoginAsync(LoginRequest request, string ipAddress, string headerUserAgent)
    {
        var user = await userManager.FindByEmailAsync(request.Email)
                   ?? await userManager.FindByNameAsync(request.Email);

        if (user == null)
        {
            return null;
        }

        var safeUserAgent = !string.IsNullOrWhiteSpace(request.UserAgent)
            ? request.UserAgent
            : (!string.IsNullOrWhiteSpace(headerUserAgent) ? headerUserAgent : "Aumo Client");

        string deviceCategory = request.IsMobileClient
            ? "Mobile"
            : (request.IsDesktopClient ? "Desktop" : "Web");

        string osValue = !string.IsNullOrWhiteSpace(request.OperatingSystem)
            ? request.OperatingSystem
            : deviceCategory;

        if (await userManager.IsLockedOutAsync(user))
        {
            return await this.BuildLockedOutResponseAsync(user);
        }

        var signInResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            return await this.BuildLockedOutResponseAsync(user);
        }

        if (!signInResult.Succeeded)
        {
            return null;
        }

        string? jwtToken = null;

        if (!request.RequiresJwtToken)
        {
            await signInManager.SignInAsync(user, isPersistent: request.RememberMe);
        }
        else
        {
            jwtToken = await this.GenerateJwtTokenAsync(user);
        }

        await userManager.ResetAccessFailedCountAsync(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = $"{deviceCategory} login successful.",
            UserId = user.Id.ToString(),
            FullName = user.FullName ?? user.UserName ?? "User",
            AvatarUrl = user.AvatarUrl,
            Token = jwtToken,
        };
    }

    private async Task<AuthResponseDto> BuildLockedOutResponseAsync(ApplicationUser user)
    {
        var lockoutEnd = await userManager.GetLockoutEndDateAsync(user);
        return new AuthResponseDto
        {
            Success = false,
            IsLockedOut = true,
            Message = "Account is locked due to multiple failed login attempts.",
            LockoutEnd = lockoutEnd?.UtcDateTime,
        };
    }
}
