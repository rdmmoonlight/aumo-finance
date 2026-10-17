// <copyright file="JournalTypes.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Validators.JournalEntries;

/// <summary>
/// Mewakili Journal Types.
/// </summary>
public static class JournalTypes
{
    /// <summary>
    /// Mewakili Allowed.
    /// </summary>
    public static readonly string[] Allowed = { "General", "Adjusting" };

    /// <summary>
    /// Mewakili Is Valid Or Empty.
    /// </summary>
    public static bool IsValidOrEmpty(string? type, bool ignoreCase = false)
        => string.IsNullOrWhiteSpace(type)
            || Allowed.Contains(type, ignoreCase ? StringComparer.OrdinalIgnoreCase : StringComparer.Ordinal);
}