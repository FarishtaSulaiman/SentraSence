namespace SentraSence.Api.Models;

public class AudioClip
{
    public Guid AudioClipId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? AlarmEventId { get; set; }
    public AlarmEvent? AlarmEvent { get; set; }

    public string StorageUrl { get; set; } = null!;
    public double DurationMs { get; set; }

    public DateTime RecordedAt { get; set; }

    public string? DeviceId { get; set; }
    public long? FileSizeBytes { get; set; }

    // Retention / GDPR
    // Den tidpunkt då ljudfilen planeras att raderas om den inte sparas.
    public DateTime? ScheduledDeletionAt { get; set; }

    // Sätts när användaren har fått en pushpåminnelse om att ljudfilen snart raderas.
    // Förhindrar att samma påminnelse skickas flera gånger.
    public DateTime? DeletionReminderSentAt { get; set; }

    // TODO: Bestäm senare exakt hur "spara ljudfil" ska modelleras i appen.
    // Exempelvis kan en framtida lösning lägga till IsSavedByUser eller SavedAt.

    // Relations
    public ICollection<AiAnalysis> Analyses { get; set; } = new List<AiAnalysis>();
}