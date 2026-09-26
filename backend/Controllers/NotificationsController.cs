using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AumoBackend.Core;

namespace AumoBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    // Ubah return type method helper dari string ke Guid
    private Guid GetCurrentUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
    }

    // GET: api/v1/notifications
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int limit = 20)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                TargetUrl = n.TargetUrl,
                CreatedAt = n.CreatedAt.ToString("o")
            })
            .ToListAsync();

        return Ok(notifications);
    }

    // PUT: api/v1/notifications/{id}/read
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/v1/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

        return NoContent();
    }
}