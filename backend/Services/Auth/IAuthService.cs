using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using AumoBackend.ViewModels;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authentication;

namespace AumoBackend.Services.Auth;

public interface IAuthService
{
    Task<ValidationResult> ValidateLoginAsync(LoginRequest request);
    Task<AuthResponseDto?> ProcessLoginAsync(LoginRequest request, string ipAddress, string headerUserAgent);
    Task<AuthResponseDto?> ProcessGoogleLoginAsync(GoogleLoginRequest request);
    AuthenticationProperties ConfigureGoogleRedirectProperties(string redirectUrl);
    Task<string?> ProcessGoogleCallbackAsync(ClaimsPrincipal principal, string loginProvider, string providerKey);
    Task<UserProfileViewModel?> GetUserProfileAsync(ClaimsPrincipal userPrincipal);
    Task LogoutAsync();
}
