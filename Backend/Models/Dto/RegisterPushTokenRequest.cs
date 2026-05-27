namespace SentraSence.Api.Models.Dto;

public class RegisterPushTokenRequest
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = null!;
    public string? Platform { get; set; }
}