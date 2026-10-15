using System;
using System.Collections.Generic;

namespace AumoBackend.Models;

public partial class UserSession
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string DeviceName { get; set; } = null!;

    public string Browser { get; set; } = null!;

    public string OperatingSystem { get; set; } = null!;

    public string IpAddress { get; set; } = null!;

    public string Country { get; set; } = null!;

    public string UserAgent { get; set; } = null!;

    public string RefreshTokenHash { get; set; } = null!;

    public bool IsActive { get; set; }

    public bool IsCurrent { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime LastActivityAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
