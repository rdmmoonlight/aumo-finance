using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.ViewModels;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace AumoBackend.ViewModels
{

    public class GuardianDashboardViewModel
    {
        public SecurityStatusViewModel SecurityStatus { get; set; } = new();
        public List<LoginActivityViewModel> RecentActivities { get; set; } = new();
        public List<ActiveSessionViewModel> ActiveSessions { get; set; } = new();
    }

    public class SecurityStatusViewModel
    {
        public string StatusLevel { get; set; } = "Good";
        public int ActiveSessionsCount { get; set; }
        public int FailedAttemptsLast24Hours { get; set; }
        public DateTime? LastSuccessfulLogin { get; set; }
    }

    public class LoginActivityViewModel
    {
        public Guid Id { get; set; }
        public string? ActivityType { get; set; }
        public string? Device { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Browser { get; set; }
        public string? IpAddress { get; set; }
        public string? Country { get; set; }
        public bool IsSuccess { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ActiveSessionViewModel
    {
        public Guid Id { get; set; }
        public string? DeviceName { get; set; }
        public string? OperatingSystem { get; set; }
        public string? Browser { get; set; }
        public string? IpAddress { get; set; }
        public string? Country { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime LastActivityAt { get; set; }
    }

    public class SettingsViewModel
    {
        [Display(Name = "Mode Gelap")]
        public bool IsDarkMode { get; set; }

        [Display(Name = "Peringatan Sistem")]
        public bool EnableSystemAlerts { get; set; } = true;
    }
}
