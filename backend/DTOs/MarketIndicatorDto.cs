namespace AumoBackend.DTOs
{
    public class MarketIndicatorDto
    {
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        
        // Menggunakan decimal agar sinkron dengan kalkulasi numerik
        public decimal Price { get; set; }
        public decimal Change { get; set; }

        // IsUp otomatis bernilai true jika Change >= 0, tidak perlu di-assign manual
        public bool IsUp => Change >= 0;
    }
}
