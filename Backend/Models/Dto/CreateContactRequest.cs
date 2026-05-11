using System.ComponentModel.DataAnnotations;

namespace SentraSence.Api.Models.Dto;

public class CreateContactRequest
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [EmailAddress]
    public string? Email { get; set; }

    public string? RelationshipType { get; set; }

    public bool IsPrimary { get; set; }
}

public class ContactResponse
{
    public Guid TrustedContactId { get; set; }
    public string Name { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Email { get; set; }
    public string? RelationshipType { get; set; }
    public bool IsPrimary { get; set; }
}
