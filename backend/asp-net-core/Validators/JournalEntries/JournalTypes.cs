namespace AumoBackend.Validators.JournalEntries;

public static class JournalTypes
{
    public static readonly string[] Allowed = { "General", "Adjusting" };

    public static bool IsValidOrEmpty(string? type, bool ignoreCase = false)
        => string.IsNullOrWhiteSpace(type)
            || Allowed.Contains(type, ignoreCase ? StringComparer.OrdinalIgnoreCase : StringComparer.Ordinal);
}
