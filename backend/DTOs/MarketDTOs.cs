namespace AumoBackend.DTOs
{
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
}
