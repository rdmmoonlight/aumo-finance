using System.Text.Json.Serialization;

namespace AumoBackend.DTOs.Home
{

    public class ApiIndonesiaKursResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("data")]
        public KursData? Data { get; set; }
    }

    public class KursData
    {
        [JsonPropertyName("base")]
        public string Base { get; set; } = string.Empty;

        [JsonPropertyName("target")]
        public string Target { get; set; } = string.Empty;

        [JsonPropertyName("rate")]
        public decimal Rate { get; set; }

        [JsonPropertyName("change")]
        public decimal Change { get; set; }
    }

    /// <summary>
    /// DTO untuk indikator data pasar (IHSG, Saham, Kurs, Emas, dll)
    /// </summary>
    public class MarketIndicatorDto
    {
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        // Mendukung baik input decimal murni maupun string (dikonversi otomatis secara aman)
        private decimal _price;
        public object Price
        {
            get => _price;
            set
            {
                if (value is decimal decValue)
                    _price = decValue;
                else if (value != null && decimal.TryParse(value.ToString(), out decimal parsedValue))
                    _price = parsedValue;
                else
                    _price = 0m;
            }
        }

        private decimal _change;
        public object Change
        {
            get => _change;
            set
            {
                if (value is decimal decValue)
                    _change = decValue;
                else if (value != null && decimal.TryParse(value.ToString(), out decimal parsedValue))
                    _change = parsedValue;
                else
                    _change = 0m;
            }
        }

        // Fleksibel: dapat di-assign manual ATAU mengkalkulasi otomatis dari Change jika tidak di-assign
        private bool? _isUp;
        public bool IsUp
        {
            get
            {
                if (_isUp.HasValue) return _isUp.Value;
                return _change >= 0;
            }
            set => _isUp = value;
        }
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
}
