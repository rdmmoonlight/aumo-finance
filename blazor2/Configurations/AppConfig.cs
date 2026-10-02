namespace AumoBlazor.Configurations
{
    public class AppConfig
    {
        public string WebApiUrl { get; set; } = "http://localhost:5000/";
        public string AppName { get; set; } = "AumoFinanceApp";
        public string AuthLoginPath { get; set; } = "/auth/login";
        public string AuthAccessDeniedPath { get; set; } = "/auth/login";
        public int AuthCookieExpireDays { get; set; } = 30;
        public string MarketUserAgent { get; set; } = "AumoFinanceApp/1.0";
    }
}
