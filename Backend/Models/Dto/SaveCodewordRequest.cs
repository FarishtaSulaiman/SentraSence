using System.ComponentModel.DataAnnotations;

namespace SentraSence.Api.Models.Dto;

public class SaveCodewordRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Codeword { get; set; } = null!;
}
