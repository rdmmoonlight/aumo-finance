// <copyright file="UserProfileViewModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.ViewModels;

using System;
using System.Collections.Generic;
using System.Security.Claims;
using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;

/// <summary>
/// Model data User Profile View Model.
/// </summary>
public class UserProfileViewModel
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Mewakili User Id.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Mewakili Email.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Mewakili User Name.
    /// </summary>
    public string? UserName { get; set; }

    /// <summary>
    /// Mewakili Full Name.
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Mewakili Phone Number.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Mewakili Avatar Url.
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Mewakili Bio.
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Mewakili Roles.
    /// </summary>
    public IList<string> Roles { get; set; } = new List<string>();

    /// <summary>
    /// Mewakili Custom Claims.
    /// </summary>
    public IList<Claim> CustomClaims { get; set; } = new List<Claim>();
}
