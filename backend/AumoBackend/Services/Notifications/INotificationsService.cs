namespace AumoBackend.Services.Notifications;

using AumoBackend.DTOs;

public interface INotificationsService
{
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(Guid userId, int limit);

    Task<bool> MarkAsReadAsync(Guid id, Guid userId);

    Task MarkAllAsReadAsync(Guid userId);
}
