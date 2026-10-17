// <copyright file="INotificationsService.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Notifications;

using AumoBackend.Controllers.Reports;
using AumoBackend.DTOs;
using AumoBackend.Helpers;
using AumoBackend.Models;
using AumoBackend.Services.Auth;
using AumoBackend.Services.Identity;
/// <summary>
/// Layanan logika bisnis untuk I Notifications Service.
/// </summary>

public interface INotificationsService
{
    /// <summary>
    /// Mengambil data  Notifications By User Id Async.
    /// </summary>
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(Guid userId, int limit);
    /// <summary>
    /// Mewakili Mark As Read Async.
    /// </summary>

    Task<bool> MarkAsReadAsync(Guid id, Guid userId);
    /// <summary>
    /// Mewakili Mark All As Read Async.
    /// </summary>

    Task MarkAllAsReadAsync(Guid userId);
}
