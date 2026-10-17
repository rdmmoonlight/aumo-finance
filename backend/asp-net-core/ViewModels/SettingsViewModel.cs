// <copyright file="SettingsViewModel.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.ViewModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using AumoBackend.Controllers.Reports;
    using AumoBackend.Helpers;
    using AumoBackend.Models;
    using AumoBackend.Services.Auth;
    using AumoBackend.Services.Identity;
    using AumoBackend.ViewModels;
    /// <summary>
    /// Model data Guardian Dashboard View Model.
    /// </summary>

    public class GuardianDashboardViewModel
    {
        /// <summary>
        /// Mewakili Security Status.
        /// </summary>
        public SecurityStatusViewModel SecurityStatus { get; set; } = new();
        /// <summary>
        /// Mewakili Recent Activities.
        /// </summary>

        public List<LoginActivityViewModel> RecentActivities { get; set; } = new();
        /// <summary>
        /// Mewakili Active Sessions.
        /// </summary>

        public List<ActiveSessionViewModel> ActiveSessions { get; set; } = new();
    }
    /// <summary>
    /// Model data Security Status View Model.
    /// </summary>

    public class SecurityStatusViewModel
    {
        /// <summary>
        /// Mewakili Status Level.
        /// </summary>
        public string StatusLevel { get; set; } = "Good";
        /// <summary>
        /// Mewakili Active Sessions Count.
        /// </summary>

        public int ActiveSessionsCount { get; set; }
        /// <summary>
        /// Mewakili Failed Attempts Last24 Hours.
        /// </summary>

        public int FailedAttemptsLast24Hours { get; set; }
        /// <summary>
        /// Mewakili Last Successful Login.
        /// </summary>

        public DateTime? LastSuccessfulLogin { get; set; }
    }
    /// <summary>
    /// Model data Login Activity View Model.
    /// </summary>

    public class LoginActivityViewModel
    {
        /// <summary>
        /// Mewakili Id.
        /// </summary>
        public Guid Id { get; set; }
        /// <summary>
        /// Mewakili Activity Type.
        /// </summary>

        public string? ActivityType { get; set; }
        /// <summary>
        /// Mewakili Device.
        /// </summary>

        public string? Device { get; set; }
        /// <summary>
        /// Mewakili Operating System.
        /// </summary>

        public string? OperatingSystem { get; set; }
        /// <summary>
        /// Mewakili Browser.
        /// </summary>

        public string? Browser { get; set; }
        /// <summary>
        /// Mewakili Ip Address.
        /// </summary>

        public string? IpAddress { get; set; }
        /// <summary>
        /// Mewakili Country.
        /// </summary>

        public string? Country { get; set; }
        /// <summary>
        /// Mewakili Is Success.
        /// </summary>

        public bool IsSuccess { get; set; }
        /// <summary>
        /// Membuat data d At baru.
        /// </summary>

        public DateTime CreatedAt { get; set; }
    }
    /// <summary>
    /// Model data Active Session View Model.
    /// </summary>

    public class ActiveSessionViewModel
    {
        /// <summary>
        /// Mewakili Id.
        /// </summary>
        public Guid Id { get; set; }
        /// <summary>
        /// Mewakili Device Name.
        /// </summary>

        public string? DeviceName { get; set; }
        /// <summary>
        /// Mewakili Operating System.
        /// </summary>

        public string? OperatingSystem { get; set; }
        /// <summary>
        /// Mewakili Browser.
        /// </summary>

        public string? Browser { get; set; }
        /// <summary>
        /// Mewakili Ip Address.
        /// </summary>

        public string? IpAddress { get; set; }
        /// <summary>
        /// Mewakili Country.
        /// </summary>

        public string? Country { get; set; }
        /// <summary>
        /// Mewakili Is Current.
        /// </summary>

        public bool IsCurrent { get; set; }
        /// <summary>
        /// Mewakili Last Activity At.
        /// </summary>

        public DateTime LastActivityAt { get; set; }
    }
    /// <summary>
    /// Model data Settings View Model.
    /// </summary>

    public class SettingsViewModel
    {
        /// <summary>
        /// Mewakili Is Dark Mode.
        /// </summary>
        [Display(Name = "Mode Gelap")]
        public bool IsDarkMode { get; set; }
        /// <summary>
        /// Mewakili Enable System Alerts.
        /// </summary>

        [Display(Name = "Peringatan Sistem")]
        public bool EnableSystemAlerts { get; set; } = true;
    }
}
