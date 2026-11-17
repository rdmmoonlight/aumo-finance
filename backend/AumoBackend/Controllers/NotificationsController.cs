namespace AumoBackend.Controllers;

using System.Security.Claims;
using AumoBackend.DTOs;
using AumoBackend.Services.Notifications;
using AumoBackend.Validators.Common;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("/notifications")]

public class NotificationsController : ControllerBase
{
    private readonly INotificationsService notificationsService;
    private readonly IValidator<GetNotificationsQuery> queryValidator;

    public NotificationsController(INotificationsService notificationsService, IValidator<GetNotificationsQuery> queryValidator)
    {
        this.notificationsService = notificationsService;
        this.queryValidator = queryValidator;
    }

    // Ubah return type method helper dari string ke Guid
    private Guid GetCurrentUserId()
    {
        var userIdStr = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    // GET: api/v1/notifications
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] GetNotificationsQuery query)
    {
        var validation = await this.queryValidator.ValidateAsync(query);
        if (!validation.IsValid)
        {
            return this.BadRequest(validation.ToErrorResponse());
        }

        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized();
        }

        var notifications = await this.notificationsService.GetNotificationsByUserIdAsync(userId, query.Limit);

        return this.Ok(notifications);
    }

    // PUT: api/v1/notifications/{id}/read
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized();
        }

        var found = await this.notificationsService.MarkAsReadAsync(id, userId);
        if (!found)
        {
            return this.NotFound();
        }

        return this.NoContent();
    }

    // PUT: api/v1/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = this.GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return this.Unauthorized();
        }

        await this.notificationsService.MarkAllAsReadAsync(userId);

        return this.NoContent();
    }
}
