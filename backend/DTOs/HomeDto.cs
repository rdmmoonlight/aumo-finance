namespace AumoBackend.DTOs;

/// <summary>
/// DTO untuk indikator data pasar (IHSG, Saham, Kurs, Emas, dll)
/// </summary>
public class MarketIndicatorDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Change { get; set; }
    public bool IsUp => Change >= 0;
}

/// <summary>
/// Wrapper standar untuk response API
/// </summary>
public class ApiResponseDto<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
    public string? Message { get; set; }
}