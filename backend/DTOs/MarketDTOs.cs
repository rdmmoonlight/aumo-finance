namespace AumoBackend.DTOs;

/// <summary>
/// DTO untuk indikator data pasar (IHSG, Saham, Kurs, Emas, dll)
/// </summary>
public class MarketIndicatorDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    // Properti berbasis object agar aman di-assign baik decimal maupun string terformat dari Service
    public object Price { get; set; } = 0m;
    public object Change { get; set; } = 0m;

    // Auto-setter & getter agar tidak error CS0200 jika di-assign manual dari Service
    private bool? _isUp;
    public bool IsUp
    {
        get
        {
            if (_isUp.HasValue) return _isUp.Value;

            // Kalkulasi otomatis fallback jika tidak di-assign manual
            if (Change is decimal decChange) return decChange >= 0;
            if (decimal.TryParse(Change?.ToString(), out decimal parsedChange)) return parsedChange >= 0;

            return true;
        }
        set => _isUp = value;
    }
}

/// <summary>
/// Response model dari APIIndonesia Kurs (Menyelesaikan error CS0246 di MarketDataService)
/// </summary>
public class ApiIndonesiaKursResponse
{
    public bool Success { get; set; }
    public KursDataDto? Data { get; set; }
}

public class KursDataDto
{
    public string Base { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal Change { get; set; }
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
