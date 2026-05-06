namespace SentraSence.Api.Models;

public class Notification
{
    public Guid NotificationId { get; set; }

    public Guid AlarmEventId { get; set; }
    public AlarmEvent AlarmEvent { get; set; } = null!;

    public Guid TrustedContactId { get; set; }
    public TrustedContact TrustedContact { get; set; } = null!;

    public string Channel { get; set; } = null!;
    public string Status { get; set; } = null!;

    public DateTime? SentAt { get; set; }

    public string? ProviderMessageId { get; set; }
    public string? ErrorMessage { get; set; }

    public int AttemptCount { get; set; }
}
