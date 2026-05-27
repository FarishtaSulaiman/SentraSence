using System.ComponentModel.DataAnnotations;

namespace SentraSence.Api.Models.Dto;

public class UpdateProfileRequest
{
    [StringLength(200)]
    public string? Name { get; set; }

    [StringLength(30)]
    public string? Phone { get; set; }
}
