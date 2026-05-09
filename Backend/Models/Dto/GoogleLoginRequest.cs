namespace SentraSence.Api.Models.Dto;

public class GoogleLoginRequest
{
    public string Email { get; set; } = null!;
    public string? Name { get; set; }
    public string? GoogleId { get; set; }
    public string? Picture { get; set; }
}