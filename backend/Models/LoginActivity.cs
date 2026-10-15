using System;
using System.Collections.Generic;

namespace AumoBackend.Models;

public partial class LoginActivity
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string ActivityType { get; set; } = null!;

    public bool IsSuccess { get; set; }

    public string Device { get; set; } = null!;

    public string Browser { get; set; } = null!;

    public string OperatingSystem { get; set; } = null!;

    public string IpAddress { get; set; } = null!;

    public string Country { get; set; } = null!;

    public string UserAgent { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
