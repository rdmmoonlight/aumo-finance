using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using System;

namespace AumoBackend.Models;

public class RecoveryCode
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public string CodeHash { get; set; } = string.Empty;

    public bool Used { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UsedAt { get; set; }
}

public class SecuritySetting
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public bool EmailVerified { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool LoginNotificationEnabled { get; set; }
    public int SessionTimeoutMinutes { get; set; } = 30;
    public DateTime UpdatedAt { get; set; }
}

public class TrustedDevice
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceIdentifier { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public bool IsTrusted { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime LastUsedAt { get; set; }
}
