namespace AumoBackend.Dtos.External
{
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
}