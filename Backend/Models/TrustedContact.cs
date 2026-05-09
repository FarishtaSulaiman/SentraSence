namespace SentraSence.Api.Models;

public class TrustedContact
{
    public Guid TrustedContactId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Name { get; set; } = null!;

    // Required (måste finnas för SMS)
    public string Phone { get; set; } = null!;

    public string? Email { get; set; }
    public string? RelationshipType { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? ContactStatus { get; set; }
}