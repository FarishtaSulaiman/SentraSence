using System.ComponentModel.DataAnnotations;

namespace SentraSence.Api.Models.Dto;

public class UpdateContactRequest
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [Required, StringLength(30, MinimumLength = 5)]
    public string Phone { get; set; } = null!;

    [EmailAddress, StringLength(255)]
    public string? Email { get; set; }

    [StringLength(50)]
    public string? RelationshipType { get; set; }

    public bool IsPrimary { get; set; }
}
