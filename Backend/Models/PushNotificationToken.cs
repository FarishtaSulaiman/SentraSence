namespace SentraSence.Api.Models;


// Den här modellen lagrar användarens Expo push token, så backend senare vet vilka enheter som ska få push-notiser.
public class PushNotificationToken
{
    public Guid PushNotificationTokenId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Token { get; set; } = null!;
    public string? Platform { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}