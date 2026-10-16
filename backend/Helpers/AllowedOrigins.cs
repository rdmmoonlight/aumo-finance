// <copyright file="AllowedOrigins.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Helpers;

/// <summary>
/// Satu sumber daftar origin frontend yang dipercaya.
/// Dipakai oleh CORS (Program.cs) dan validasi redirect OAuth (AuthController).
/// </summary>
public static class AllowedOrigins
{
    public static readonly string[] All =
    {
        "http://localhost:3000",
        "https://aumonext.vercel.app",
    };

    public static bool IsAllowed(Uri uri)
    {
        var origin = $"{uri.Scheme}://{uri.Authority}";
        return All.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
}
