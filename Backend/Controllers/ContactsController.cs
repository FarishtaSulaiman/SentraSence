using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Models;
using SentraSence.Api.Models.Dto;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContactsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/contacts/{userId}
    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetContacts(Guid userId)
    {
        var contacts = await _db.TrustedContacts
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IsPrimary)
            .ThenBy(c => c.Name)
            .Select(c => new ContactResponse
            {
                TrustedContactId = c.TrustedContactId,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                RelationshipType = c.RelationshipType,
                IsPrimary = c.IsPrimary,
            })
            .ToListAsync();

        return Ok(contacts);
    }

    // POST /api/contacts
    [HttpPost]
    public async Task<IActionResult> AddContact([FromBody] CreateContactRequest request)
    {
        var user = await _db.Users.FindAsync(request.UserId);
        if (user is null) return NotFound("User not found.");

        // If new contact is primary, demote existing primaries
        if (request.IsPrimary)
        {
            var existingPrimaries = await _db.TrustedContacts
                .Where(c => c.UserId == request.UserId && c.IsPrimary)
                .ToListAsync();

            foreach (var p in existingPrimaries)
                p.IsPrimary = false;
        }

        var contact = new TrustedContact
        {
            TrustedContactId = Guid.NewGuid(),
            UserId = request.UserId,
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim(),
            RelationshipType = request.RelationshipType?.Trim(),
            IsPrimary = request.IsPrimary,
            CreatedAt = DateTime.UtcNow,
        };

        _db.TrustedContacts.Add(contact);
        await _db.SaveChangesAsync();

        return Ok(new ContactResponse
        {
            TrustedContactId = contact.TrustedContactId,
            Name = contact.Name,
            Phone = contact.Phone,
            Email = contact.Email,
            RelationshipType = contact.RelationshipType,
            IsPrimary = contact.IsPrimary,
        });
    }

    // PUT /api/contacts/{contactId}
    [HttpPut("{contactId:guid}")]
    public async Task<IActionResult> UpdateContact(Guid contactId, [FromBody] UpdateContactRequest request)
    {
        var contact = await _db.TrustedContacts.FindAsync(contactId);
        if (contact is null) return NotFound();

        contact.Name = request.Name.Trim();
        contact.Phone = request.Phone.Trim();
        contact.Email = request.Email?.Trim();
        contact.RelationshipType = request.RelationshipType?.Trim();

        if (request.IsPrimary && !contact.IsPrimary)
        {
            var others = await _db.TrustedContacts
                .Where(c => c.UserId == contact.UserId && c.IsPrimary)
                .ToListAsync();
            foreach (var c in others) c.IsPrimary = false;
            contact.IsPrimary = true;
        }
        else if (!request.IsPrimary)
        {
            contact.IsPrimary = false;
        }

        await _db.SaveChangesAsync();

        return Ok(new ContactResponse
        {
            TrustedContactId = contact.TrustedContactId,
            Name = contact.Name,
            Phone = contact.Phone,
            Email = contact.Email,
            RelationshipType = contact.RelationshipType,
            IsPrimary = contact.IsPrimary,
        });
    }

    // DELETE /api/contacts/{contactId}
    [HttpDelete("{contactId:guid}")]
    public async Task<IActionResult> DeleteContact(Guid contactId)
    {
        var contact = await _db.TrustedContacts.FindAsync(contactId);
        if (contact is null) return NotFound();

        _db.TrustedContacts.Remove(contact);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/contacts/{contactId}/set-primary
    [HttpPatch("{contactId:guid}/set-primary")]
    public async Task<IActionResult> SetPrimary(Guid contactId)
    {
        var contact = await _db.TrustedContacts.FindAsync(contactId);
        if (contact is null) return NotFound();

        var others = await _db.TrustedContacts
            .Where(c => c.UserId == contact.UserId && c.IsPrimary)
            .ToListAsync();

        foreach (var c in others) c.IsPrimary = false;
        contact.IsPrimary = true;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
