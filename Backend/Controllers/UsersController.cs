using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Models;
using SentraSence.Api.Models.Dto;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // PUT /api/users/{userId}/codeword
    [HttpPut("{userId:guid}/codeword")]
    public async Task<IActionResult> SaveCodeword(Guid userId, [FromBody] SaveCodewordRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Codeword = request.Codeword.Trim();
        user.CodewordTrained = false; // reset when changed
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/users/{userId}/consents
    [HttpPost("{userId:guid}/consents")]
    public async Task<IActionResult> SaveConsents(Guid userId, [FromBody] SaveConsentsRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        var existing = await _db.UserConsents
            .Where(c => c.UserId == userId)
            .ToListAsync();

        foreach (var item in request.Consents)
        {
            var record = existing.FirstOrDefault(c => c.ConsentType == item.ConsentType);
            if (record is null)
            {
                _db.UserConsents.Add(new UserConsent
                {
                    UserConsentId = Guid.NewGuid(),
                    UserId = userId,
                    ConsentType = item.ConsentType,
                    Granted = item.Granted,
                    ConsentVersion = request.ConsentVersion,
                    GrantedAt = DateTime.UtcNow,
                });
            }
            else
            {
                record.Granted = item.Granted;
                record.ConsentVersion = request.ConsentVersion;
                record.GrantedAt = DateTime.UtcNow;
                record.WithdrawnAt = item.Granted ? null : DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/users/{userId}/consents
    [HttpGet("{userId:guid}/consents")]
    public async Task<IActionResult> GetConsents(Guid userId)
    {
        var consents = await _db.UserConsents
            .Where(c => c.UserId == userId)
            .ToListAsync();

        return Ok(consents);
    }
}
