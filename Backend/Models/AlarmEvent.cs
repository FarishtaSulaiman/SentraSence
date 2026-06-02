namespace SentraSence.Api.Models;

public class AlarmEvent
{
    public Guid AlarmEventId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TriggerType { get; set; } = null!;
    public string Status { get; set; } = null!;

    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    public string? Notes { get; set; }
    public string? AudioUrl { get; set; }
    public DateTime? AudioUploadedAt { get; set; }

    // Relations
    public ICollection<AudioClip> AudioClips { get; set; } = new List<AudioClip>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<AlarmLocation> Locations { get; set; } = new List<AlarmLocation>();
}