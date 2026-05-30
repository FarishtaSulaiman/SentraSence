using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Models;
using SentraSence.Api.Models.Dto;
using SentraSence.Api.Services;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPushNotificationService _pushNotificationService;

    public NotificationsController(
        AppDbContext db,
        IPushNotificationService pushNotificationService)
    {
        _db = db;
        _pushNotificationService = pushNotificationService;
    }

    // POST /api/notifications/register-token
    [HttpPost("register-token")]
    public async Task<IActionResult> RegisterToken(
        [FromBody] RegisterPushTokenRequest request)
    {
        // TODO: When backend authorization is introduced,
        // get UserId from authenticated claims instead of request.UserId.
        if (request.UserId == Guid.Empty)
        {
            return BadRequest("UserId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return BadRequest("Push token is required.");
        }

        var userExists = await _db.Users
            .AnyAsync(user => user.UserId == request.UserId);

        if (!userExists)
        {
            return NotFound("User not found.");
        }

        var normalizedToken = request.Token.Trim();

        var existingToken = await _db.PushNotificationTokens
            .FirstOrDefaultAsync(token => token.Token == normalizedToken);

        if (existingToken is not null)
        {
            existingToken.UserId = request.UserId;
            existingToken.Platform = request.Platform?.Trim();
            existingToken.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Push notification token updated."
            });
        }

        var pushToken = new PushNotificationToken
        {
            PushNotificationTokenId = Guid.NewGuid(),
            UserId = request.UserId,
            Token = normalizedToken,
            Platform = request.Platform?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.PushNotificationTokens.Add(pushToken);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Push notification token registered."
        });
    }

    // DELETE /api/notifications/unregister-token/{userId}?token=...
    [HttpDelete("unregister-token/{userId:guid}")]
    public async Task<IActionResult> UnregisterToken(
        Guid userId,
        [FromQuery] string token)
    {
        // TODO: When backend authorization is introduced,
        // get UserId from authenticated claims instead of the route.
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest("Push token is required.");
        }

        var normalizedToken = token.Trim();

        var existingToken = await _db.PushNotificationTokens
            .FirstOrDefaultAsync(pushToken =>
                pushToken.UserId == userId &&
                pushToken.Token == normalizedToken);

        if (existingToken is null)
        {
            return NotFound("Push notification token not found.");
        }

        _db.PushNotificationTokens.Remove(existingToken);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // POST /api/notifications/test/{userId}
    [HttpPost("test/{userId:guid}")]
    public async Task<IActionResult> SendTestNotification(Guid userId)
    {
        // TODO: Restrict or remove this test endpoint before production.
        // TODO: When backend authorization is introduced,
        // get UserId from authenticated claims instead of the route.

        var userExists = await _db.Users
            .AnyAsync(user => user.UserId == userId);

        if (!userExists)
        {
            return NotFound("User not found.");
        }

        await _pushNotificationService.SendPushNotificationsToUserAsync(
            userId,
            "Testnotis från SentraSense",
            "Pushnotiser är korrekt anslutna för denna enhet."
        );

        return Ok(new
        {
            message = "Test push notification requested."
        });
    }

    // GET /api/notifications/user/{userId}
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetUserNotifications(Guid userId)
    {
        // TODO: When backend authorization is introduced,
        // get UserId from authenticated claims instead of the route.
        var userExists = await _db.Users
            .AnyAsync(user => user.UserId == userId);

        if (!userExists)
        {
            return NotFound("User not found.");
        }

        var notifications = await _db.UserNotifications
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Select(notification => new
            {
                notification.UserNotificationId,
                notification.UserId,
                notification.AlarmEventId,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.IsRead,
                notification.CreatedAt
            })
            .ToListAsync();

        return Ok(notifications);
    }
}