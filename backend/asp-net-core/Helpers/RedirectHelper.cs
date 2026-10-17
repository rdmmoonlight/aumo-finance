// <copyright file="RedirectHelper.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Helpers;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Mewakili Redirect Helper.
/// </summary>
public static class RedirectHelper
{
    /// <summary>
    /// Mengambil data  Safe Redirect Url.
    /// </summary>
    public static string GetSafeRedirectUrl(this IUrlHelper urlHelper, string? targetUrl)
    {
        const string defaultUrl = "/home";

        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            return defaultUrl;
        }

        if (urlHelper.IsLocalUrl(targetUrl))
        {
            return targetUrl;
        }

        if (Uri.TryCreate(targetUrl, UriKind.Absolute, out var uri) && AllowedOrigins.IsAllowed(uri))
        {
            return targetUrl;
        }

        return defaultUrl;
    }
}