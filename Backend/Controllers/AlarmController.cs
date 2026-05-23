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
    private readonly ILogger<AlarmController> _logger;

    public AlarmController(AppDbContext db, IEmailService email, ILogger<AlarmController> logger)
    {
        _db = db;
        _email = email;
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

        await _db.SaveChangesAsync();

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

        alarm.Status = "Cancelled";
        alarm.EndedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

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

        return Ok(new { message = "Larmet bekräftat. E-post skickat. Hjälp är på väg.", alarmEventId = id, emailSentTo = contacts.Count });
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
