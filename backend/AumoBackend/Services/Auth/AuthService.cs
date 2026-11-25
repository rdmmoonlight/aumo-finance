namespace AumoBackend.Services.Auth;

using System.Threading.Tasks;
using AumoBackend.DTOs;
using AumoBackend.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

public partial class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IConfiguration configuration,
    IValidator<LoginRequest> loginValidator,
    IValidator<GoogleLoginRequest> googleLoginValidator) : IAuthService
{
    public async Task<ValidationResult> ValidateLoginAsync(LoginRequest request)
    {
        return await loginValidator.ValidateAsync(request);
    }

    public async Task<ValidationResult> ValidateGoogleLoginAsync(GoogleLoginRequest request)
    {
        return await googleLoginValidator.ValidateAsync(request);
    }

    public async Task LogoutAsync()
    {
        await signInManager.SignOutAsync();
    }
}
