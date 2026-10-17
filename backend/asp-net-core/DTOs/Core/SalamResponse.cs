// backend/DTOs/Core/SalamResponse.cs
namespace AumoBackend.DTOs.Core;

public class SalamResponse
{
    public string Message { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class SalamRequestDto
{
    public string ClientName { get; set; } = string.Empty;
}