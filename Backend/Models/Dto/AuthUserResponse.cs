namespace SentraSence.Api.Models.Dto;

public class AuthUserResponse
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = null!;
    public string? Name { get; set; }
}