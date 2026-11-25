namespace AumoBackend.Services.Auth;

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AumoBackend.Extensions;
using AumoBackend.Models;
using AumoBackend.ViewModels;
using Microsoft.IdentityModel.Tokens;

public partial class AuthService
{
    public async Task<UserProfileViewModel?> GetUserProfileAsync(ClaimsPrincipal userPrincipal)
    {
        var user = await userManager.GetUserAsync(userPrincipal);

        if (user == null)
        {
            var userIdStr = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? userPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                         ?? userPrincipal.FindFirstValue("sub")
                         ?? userPrincipal.FindFirstValue("id");

            if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var userGuid))
            {
                user = await userManager.FindByIdAsync(userGuid.ToString());
            }
        }

        if (user == null)
        {
            return null;
        }

        var roles = await userManager.GetRolesAsync(user);
        var userClaims = await userManager.GetClaimsAsync(user);

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
            CustomClaims = userClaims,
        };
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var jwt = JwtSettings.From(configuration);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName ?? user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var roles = await userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var userClaims = await userManager.GetClaimsAsync(user);
        claims.AddRange(userClaims);

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
