using AumoBackend.Controllers.Reports;
using AumoBackend.Helpers;
using AumoBackend.Services.Identity;
using AumoBackend.Services.Auth;
using AumoBackend.Models;
using AumoBackend.DTOs;

namespace AumoBackend.Services.Notifications;

public interface INotificationsService
{
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(Guid userId, int limit);
    Task<bool> MarkAsReadAsync(Guid id, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
}
