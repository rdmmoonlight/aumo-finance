// <copyright file="RecoveryCode.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;

/// <summary>
/// Mewakili Recovery Code.
/// </summary>
public partial class RecoveryCode
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
    /// Mewakili Code Hash.
    /// </summary>
    public string CodeHash { get; set; } = null!;

    /// <summary>
    /// Mewakili Used.
    /// </summary>
    public bool Used { get; set; }

    /// <summary>
    /// Membuat data d At baru.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Mewakili Used At.
    /// </summary>
    public DateTime? UsedAt { get; set; }

    /// <summary>
    /// Mewakili User.
    /// </summary>
    public virtual ApplicationUser User { get; set; } = null!;
}
