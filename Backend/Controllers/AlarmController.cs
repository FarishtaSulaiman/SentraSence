using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Models;
using SentraSence.Api.Models.Dto;
using SentraSence.Api.Services;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/alarm")]
public class AlarmController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly IPushNotificationService _pushNotifications;
    private readonly ILogger<AlarmController> _logger;

    public AlarmController(
        AppDbContext db, 
        IEmailService email, 
        IPushNotificationService pushNotifications, 
        ILogger<AlarmController> logger)
    {
        _db = db;
        _email = email;
        _pushNotifications = pushNotifications;
        _logger = logger;
    }

    // POST /api/alarm/trigger
    // Skapar ett nödlarm — SMS skickas INTE här, utan vid confirm/timeout
    [HttpPost("trigger")]
    public async Task<IActionResult> TriggerAlarm([FromBody] TriggerAlarmRequest request)
    {
        var user = await _db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound("User not found.");

        var alarmEvent = new AlarmEvent
        {
            AlarmEventId = Guid.NewGuid(),
            UserId = request.UserId,
            TriggerType = request.TriggerType,
            Status = "Active",
            StartedAt = DateTime.UtcNow,
        };

        _db.AlarmEvents.Add(alarmEvent);

        // Spara initial position
        _db.AlarmLocations.Add(new AlarmLocation
        {
            AlarmLocationId = Guid.NewGuid(),
            AlarmEventId = alarmEvent.AlarmEventId,
            Lat = request.Lat,
            Lon = request.Lon,
            CapturedAt = DateTime.UtcNow,
        });

        _db.UserNotifications.Add(new UserNotification
{
            UserNotificationId = Guid.NewGuid(),
            UserId = request.UserId,
            AlarmEventId = alarmEvent.AlarmEventId,
            Title = "Larm aktiverat",
            Message = "Vi har startat ett nödlarm. Bekräfta eller avbryt.",
            Type = "alarm_triggered",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        await _pushNotifications.SendPushNotificationsToUserAsync(
            request.UserId,
            "Larm aktiverat",
            "Vi har startat ett nödlarm. Bekräfta eller avbryt.",
            new
            {
                alarmEventId = alarmEvent.AlarmEventId,
                type = "alarm_triggered"
            }
        );

        var contactCount = await _db.TrustedContacts
            .CountAsync(c => c.UserId == request.UserId);

        return Ok(new AlarmTriggerResponse
        {
            AlarmEventId = alarmEvent.AlarmEventId,
            Status = alarmEvent.Status,
            ContactsNotified = contactCount,
            StartedAt = alarmEvent.StartedAt,
        });
    }

    // POST /api/alarm/{id}/location
    // Uppdaterar positionen för ett aktivt larm (anropas var 10:e sekund)
    [HttpPost("{id:guid}/location")]
    public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] UpdateAlarmLocationRequest request)
    {
        var alarm = await _db.AlarmEvents.FindAsync(id);
        if (alarm is null) return NotFound("Alarm not found.");
        if (alarm.Status != "Active" && alarm.Status != "Confirmed") return BadRequest("Alarm is not active.");

        _db.AlarmLocations.Add(new AlarmLocation
        {
            AlarmLocationId = Guid.NewGuid(),
            AlarmEventId = id,
            Lat = request.Lat,
            Lon = request.Lon,
            Accuracy = request.Accuracy,
            CapturedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // POST /api/alarm/{id}/cancel
    // Avbryter larmet (falsklarm)
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelAlarm(Guid id)
    {
        var alarm = await _db.AlarmEvents.FindAsync(id);
        if (alarm is null) return NotFound("Alarm not found.");

        if (alarm.Status == "Cancelled")
        {
            return Ok(new { message = "Larmet är redan avbrutet.", alarmEventId = id });
        }

        if (alarm.Status == "Confirmed")
        {
            return BadRequest("Ett bekräftat larm kan inte avbrytas.");
        }

        if (alarm.Status != "Active")
        {
            return BadRequest("Endast aktiva larm kan avbrytas.");
        }

        alarm.Status = "Cancelled";
        alarm.EndedAt = DateTime.UtcNow;

        _db.UserNotifications.Add(new UserNotification
{
            UserNotificationId = Guid.NewGuid(),
            UserId = alarm.UserId,
            AlarmEventId = id,
            Title = "Larm avbrutet",
            Message = "Larmet har avbrutits.",
            Type = "alarm_cancelled",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        await _pushNotifications.SendPushNotificationsToUserAsync(
            alarm.UserId,
            "Larm avbrutet",
            "Larmet har avbrutits.",
            new
            {
                alarmEventId = id,
                type = "alarm_cancelled"
            }
        );

        return Ok(new { message = "Larmet avbröts.", alarmEventId = id });
    }

    // POST /api/alarm/{id}/confirm
    // Bekräftar larm (manuellt eller via timeout) — skickar SMS till alla kontakter
    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmAlarm(Guid id)
    {
        var alarm = await _db.AlarmEvents
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.AlarmEventId == id);
        if (alarm is null) return NotFound("Alarm not found.");
        if (alarm.Status == "Confirmed") return Ok(new { message = "Already confirmed.", alarmEventId = id });

        alarm.Status = "Confirmed";
        await _db.SaveChangesAsync();

        // Hämta senaste position
        var lastLocation = await _db.AlarmLocations
            .Where(l => l.AlarmEventId == id)
            .OrderByDescending(l => l.CapturedAt)
            .FirstOrDefaultAsync();

        double lat = lastLocation?.Lat ?? 0;
        double lon = lastLocation?.Lon ?? 0;

        // Skicka mail till alla kontakter som har en e-postadress
        var contacts = await _db.TrustedContacts
            .Where(c => c.UserId == alarm.UserId && c.Email != null)
            .ToListAsync();

        var userName = alarm.User.Name ?? "Okänd användare";
        var emailTasks = contacts.Select(contact =>
            SendEmailWithErrorHandling(contact.Email!, contact.Name, userName, lat, lon)
        );
        await Task.WhenAll(emailTasks);

        _db.UserNotifications.Add(new UserNotification
        {
            UserNotificationId = Guid.NewGuid(),
            UserId = alarm.UserId,
            AlarmEventId = id,
            Title = "Kontakt meddelad",
            Message = "Dina nödkontakter har fått email med din position.",
            Type = "contacts_notified",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        await _pushNotifications.SendPushNotificationsToUserAsync(
            alarm.UserId,
            "Kontakt meddelad",
            "Dina nödkontakter har fått email med din position.",
            new
            {
                alarmEventId = id,
                type = "contacts_notified"
            }
        );

        return Ok(new
        {
            message = "Larmet bekräftat. E-post och pushnotis skickade. Hjälp är på väg.",
            alarmEventId = id,
            emailSentTo = contacts.Count
        });
    }

    // POST /api/alarm/share-location
    // Skickar ett platsdelningsmail till alla nödkontakter
    [HttpPost("share-location")]
    public async Task<IActionResult> ShareLocation([FromBody] ShareLocationRequest request)
    {
        var user = await _db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound("User not found.");

        var contacts = await _db.TrustedContacts
            .Where(c => c.UserId == request.UserId && c.Email != null)
            .ToListAsync();

        if (contacts.Count == 0)
            return Ok(new { message = "Inga kontakter med e-postadress hittades.", emailSentTo = 0 });

        var userName = user.Name ?? "Okänd användare";
        var emailTasks = contacts.Select(contact =>
            SendLocationEmailWithErrorHandling(contact.Email!, contact.Name, userName, request.Lat, request.Lon)
        );
        await Task.WhenAll(emailTasks);

        return Ok(new { message = "Plats delad.", emailSentTo = contacts.Count });
    }

    private async Task SendLocationEmailWithErrorHandling(string toEmail, string toName, string userName, double lat, double lon)
    {
        try
        {
            await _email.SendLocationShareEmailAsync(toEmail, toName, userName, lat, lon);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send location email to {Email}", toEmail);
        }
    }

    // GET /api/alarm/history/{userId}
    [HttpGet("history/{userId:guid}")]
    public async Task<IActionResult> GetHistory(Guid userId)
    {
        var events = await _db.AlarmEvents
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
            .Select(a => new
            {
                alarmEventId = a.AlarmEventId,
                triggerType = a.TriggerType,
                status = a.Status,
                startedAt = a.StartedAt,
                endedAt = a.EndedAt,
                notes = a.Notes,
            })
            .ToListAsync();

        return Ok(events);
    }

    private async Task SendEmailWithErrorHandling(string toEmail, string toName, string userName, double lat, double lon)
    {
        try
        {
            await _email.SendAlarmEmailAsync(toEmail, toName, userName, lat, lon);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}
