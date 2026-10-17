// <copyright file="IAuthService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Auth;

using System.Security.Claims;
using System.Threading.Tasks;
using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
using AumoBackend.ViewModels;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authentication;
/// <summary>
/// Layanan logika bisnis untuk I Auth Service.
/// </summary>

public interface IAuthService
{
    /// <summary>
    /// Mewakili Validate Login Async.
    /// </summary>
    Task<ValidationResult> ValidateLoginAsync(LoginRequest request);
/// <summary>
/// Mewakili Validate Google Login Async.
/// </summary>

    Task<ValidationResult> ValidateGoogleLoginAsync(GoogleLoginRequest request);
/// <summary>
/// Mewakili Process Login Async.
/// </summary>

    Task<AuthResponseDto?> ProcessLoginAsync(LoginRequest request, string ipAddress, string headerUserAgent);
/// <summary>
/// Mewakili Process Google Login Async.
/// </summary>

    Task<AuthResponseDto?> ProcessGoogleLoginAsync(GoogleLoginRequest request);
/// <summary>
/// Mewakili Configure Google Redirect Properties.
/// </summary>

    AuthenticationProperties ConfigureGoogleRedirectProperties(string redirectUrl);
/// <summary>
/// Mewakili Process Google Callback Async.
/// </summary>

    Task<string?> ProcessGoogleCallbackAsync(ClaimsPrincipal principal, string loginProvider, string providerKey);
/// <summary>
/// Mengambil data  User Profile Async.
/// </summary>

    Task<UserProfileViewModel?> GetUserProfileAsync(ClaimsPrincipal userPrincipal);
/// <summary>
/// Mewakili Logout Async.
/// </summary>

    Task LogoutAsync();
}
