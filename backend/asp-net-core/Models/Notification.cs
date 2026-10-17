// <copyright file="Notification.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;
/// <summary>
/// Mewakili Notification.
/// </summary>

public partial class Notification
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
/// Mewakili Title.
/// </summary>

    public string Title { get; set; } = null!;
/// <summary>
/// Mewakili Message.
/// </summary>

    public string Message { get; set; } = null!;
/// <summary>
/// Mewakili Type.
/// </summary>

    public string Type { get; set; } = null!;
/// <summary>
/// Mewakili Is Read.
/// </summary>

    public bool IsRead { get; set; }
/// <summary>
/// Mewakili Target Url.
/// </summary>

    public string? TargetUrl { get; set; }
/// <summary>
/// Membuat data d At baru.
/// </summary>

    public DateTime CreatedAt { get; set; }
/// <summary>
/// Mewakili User.
/// </summary>

    public virtual ApplicationUser User { get; set; } = null!;
}