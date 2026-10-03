using System.Text.Json.Serialization;

namespace AumoBackend.DTOs.External
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
}
