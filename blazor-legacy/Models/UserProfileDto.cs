namespace AumoFinance.Models
{
    public class UserProfileDto
    {
        public bool IsSuccess { get; set; }
        public System.Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public System.Collections.Generic.List<string> Roles { get; set; } = new();
    }
}
