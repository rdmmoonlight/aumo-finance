// <copyright file="JournalTypes.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Validators.JournalEntries;

/// <summary>
/// Jenis jurnal yang dikenal sistem. Selaras TransactionNumberService:
/// "Adjusting" menghasilkan prefix AJ, selain itu GJ.
/// </summary>
public static class JournalTypes
{
    public static readonly string[] Allowed = { "General", "Adjusting" };

    /// <summary>Kosong dianggap valid (memakai nilai default masing-masing endpoint).</summary>
    public static bool IsValidOrEmpty(string? type, bool ignoreCase = false)
        => string.IsNullOrWhiteSpace(type)
            || Allowed.Contains(type, ignoreCase ? StringComparer.OrdinalIgnoreCase : StringComparer.Ordinal);
}
