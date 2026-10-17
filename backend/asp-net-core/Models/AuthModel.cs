// <copyright file="AuthModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using Microsoft.AspNetCore.Identity;
/// <summary>
/// Mewakili Application User.
/// </summary>

public class ApplicationUser : IdentityUser<Guid>
{
    /// <summary>
    /// Mewakili Full Name.
    /// </summary>
    public string? FullName { get; set; }
/// <summary>
/// Mewakili Avatar Url.
/// </summary>

    public string? AvatarUrl { get; set; }
/// <summary>
/// Mewakili Bio.
/// </summary>

    public string? Bio { get; set; }
}