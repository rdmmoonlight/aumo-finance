namespace AumoBackend.Models;

using System;

public partial class RecoveryCode
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string CodeHash { get; set; } = null!;

    public bool Used { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UsedAt { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
}
