namespace SentraSence.Api.Models;

public class UserNotification
{
    public Guid UserNotificationId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? AlarmEventId { get; set; }
    public AlarmEvent? AlarmEvent { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}