// <copyright file="SecuritySetting.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Models;

using System;
using System.Collections.Generic;

public partial class SecuritySetting
{
    public Guid UserId { get; set; }

    public bool EmailVerified { get; set; }

    public bool TwoFactorEnabled { get; set; }

    public bool LoginNotificationEnabled { get; set; }

    public int SessionTimeoutMinutes { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
