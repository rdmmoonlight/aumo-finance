// <copyright file="LoginActivity.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;
/// <summary>
/// Mewakili Login Activity.
/// </summary>

public partial class LoginActivity
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
/// Mewakili Activity Type.
/// </summary>

    public string ActivityType { get; set; } = null!;
/// <summary>
/// Mewakili Is Success.
/// </summary>

    public bool IsSuccess { get; set; }
/// <summary>
/// Mewakili Device.
/// </summary>

    public string Device { get; set; } = null!;
/// <summary>
/// Mewakili Browser.
/// </summary>

    public string Browser { get; set; } = null!;
/// <summary>
/// Mewakili Operating System.
/// </summary>

    public string OperatingSystem { get; set; } = null!;
/// <summary>
/// Mewakili Ip Address.
/// </summary>

    public string IpAddress { get; set; } = null!;
/// <summary>
/// Mewakili Country.
/// </summary>

    public string Country { get; set; } = null!;
/// <summary>
/// Mewakili User Agent.
/// </summary>

    public string UserAgent { get; set; } = null!;
/// <summary>
/// Membuat data d At baru.
/// </summary>

    public DateTime CreatedAt { get; set; }
/// <summary>
/// Mewakili User.
/// </summary>

    public virtual ApplicationUser User { get; set; } = null!;
}