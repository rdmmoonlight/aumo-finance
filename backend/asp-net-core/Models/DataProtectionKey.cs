// <copyright file="DataProtectionKey.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;

/// <summary>
/// Mewakili Data Protection Key.
/// </summary>
public partial class DataProtectionKey
{
    /// <summary>
    /// Mewakili Id.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Mewakili Friendly Name.
    /// </summary>
    public string? FriendlyName { get; set; }

    /// <summary>
    /// Mewakili Xml.
    /// </summary>
    public string? Xml { get; set; }
}