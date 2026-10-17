// <copyright file="SecuritySetting.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;
/// <summary>
/// Mewakili Security Setting.
/// </summary>

public partial class SecuritySetting
{
    /// <summary>
    /// Mewakili User Id.
    /// </summary>
    public Guid UserId { get; set; }
/// <summary>
/// Mewakili Email Verified.
/// </summary>

    public bool EmailVerified { get; set; }
/// <summary>
/// Mewakili Two Factor Enabled.
/// </summary>

    public bool TwoFactorEnabled { get; set; }
/// <summary>
/// Mewakili Login Notification Enabled.
/// </summary>

    public bool LoginNotificationEnabled { get; set; }
/// <summary>
/// Mewakili Session Timeout Minutes.
/// </summary>

    public int SessionTimeoutMinutes { get; set; }
/// <summary>
/// Memperbarui data d At.
/// </summary>

    public DateTime UpdatedAt { get; set; }
/// <summary>
/// Mewakili User.
/// </summary>

    public virtual ApplicationUser User { get; set; } = null!;
}