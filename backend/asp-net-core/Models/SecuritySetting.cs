namespace AumoBackend.Models;

using System;

public partial class SecuritySetting
{
    public Guid UserId { get; set; }

    public bool EmailVerified { get; set; }

    public bool TwoFactorEnabled { get; set; }

    public bool LoginNotificationEnabled { get; set; }

    public int SessionTimeoutMinutes { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
}
