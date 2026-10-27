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

public interface INotificationsService
{
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(Guid userId, int limit);

    Task<bool> MarkAsReadAsync(Guid id, Guid userId);

    Task MarkAllAsReadAsync(Guid userId);
}
