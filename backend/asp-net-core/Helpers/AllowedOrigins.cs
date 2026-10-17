// <copyright file="AllowedOrigins.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Helpers;
/// <summary>
/// Mewakili Allowed Origins.
/// </summary>

public static class AllowedOrigins
{
    /// <summary>
    /// Mewakili All.
    /// </summary>
    public static readonly string[] All =
    {
        "http://localhost:3000",
        "https://aumonext.vercel.app",
    };
    /// <summary>
    /// Mewakili Is Allowed.
    /// </summary>

    public static bool IsAllowed(Uri uri)
    {
        var origin = $"{uri.Scheme}://{uri.Authority}";
        return All.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
}
