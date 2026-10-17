// backend/DTOs/Core/SalamResponse.cs
namespace AumoBackend.DTOs.Core;

/// <summary>
/// Model data Salam Response.
/// </summary>
public class SalamResponse
{
    /// <summary>
    /// Mewakili Message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
    /// <summary>
    /// Layanan logika bisnis untuk Service.
    /// </summary>
    public string Service { get; set; } = string.Empty;
    /// <summary>
    /// Mewakili Version.
    /// </summary>
    public string Version { get; set; } = string.Empty;
    /// <summary>
    /// Mewakili Status.
    /// </summary>
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Model data Salam Request Dto.
/// </summary>
public class SalamRequestDto
{
    /// <summary>
    /// Mewakili Client Name.
    /// </summary>
    public string ClientName { get; set; } = string.Empty;
}