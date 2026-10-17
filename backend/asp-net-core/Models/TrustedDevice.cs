// <copyright file="TrustedDevice.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;
/// <summary>
/// Mewakili Trusted Device.
/// </summary>

public partial class TrustedDevice
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
    /// Mewakili Device Identifier.
    /// </summary>

    public string DeviceIdentifier { get; set; } = null!;
    /// <summary>
    /// Mewakili Browser.
    /// </summary>

    public string Browser { get; set; } = null!;
    /// <summary>
    /// Mewakili Operating System.
    /// </summary>

    public string OperatingSystem { get; set; } = null!;
    /// <summary>
    /// Mewakili Is Trusted.
    /// </summary>

    public bool IsTrusted { get; set; }
    /// <summary>
    /// Membuat data d At baru.
    /// </summary>

    public DateTime CreatedAt { get; set; }
    /// <summary>
    /// Mewakili Last Used At.
    /// </summary>

    public DateTime LastUsedAt { get; set; }
    /// <summary>
    /// Mewakili User.
    /// </summary>

    public virtual ApplicationUser User { get; set; } = null!;
}
