// <copyright file="UserSession.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;
/// <summary>
/// Mewakili User Session.
/// </summary>

public partial class UserSession
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
    /// Mewakili Device Name.
    /// </summary>

    public string DeviceName { get; set; } = null!;
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
    /// Proses eksekusi kalkulasi Refresh Token Hash.
    /// </summary>

    public string RefreshTokenHash { get; set; } = null!;
    /// <summary>
    /// Mewakili Is Active.
    /// </summary>

    public bool IsActive { get; set; }
    /// <summary>
    /// Mewakili Is Current.
    /// </summary>

    public bool IsCurrent { get; set; }
    /// <summary>
    /// Membuat data d At baru.
    /// </summary>

    public DateTime CreatedAt { get; set; }
    /// <summary>
    /// Mewakili Last Activity At.
    /// </summary>

    public DateTime LastActivityAt { get; set; }
    /// <summary>
    /// Mewakili Revoked At.
    /// </summary>

    public DateTime? RevokedAt { get; set; }
    /// <summary>
    /// Mewakili User.
    /// </summary>

    public virtual ApplicationUser User { get; set; } = null!;
}
