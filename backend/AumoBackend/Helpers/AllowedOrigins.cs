namespace AumoBackend.Helpers;

public static class AllowedOrigins
{
    public static readonly string[] All =
    {
        "http://localhost:3000",
        "http://localhost:5173",
    };

    public static bool IsAllowed(Uri? uri)
    {
        if (uri is null)
        {
            return false;
        }

        // Izinkan aplikasi desktop Electron yang memuat file lokal (file://...)
        if (uri.Scheme.Equals("file", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var origin = $"{uri.Scheme}://{uri.Authority}";
        return All.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }

    // Overload string untuk dipakai langsung di SetIsOriginAllowed(AllowedOrigins.IsAllowed)
    public static bool IsAllowed(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
        {
            return false;
        }

        // Electron loadFile() sering mengirim header "Origin: null"
        if (origin.Equals("null", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            return IsAllowed(uri);
        }

        return false;
    }
}
