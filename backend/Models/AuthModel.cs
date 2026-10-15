using Microsoft.AspNetCore.Identity;

namespace AumoBackend.Models;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
}