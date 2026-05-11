namespace SentraSence.Api.Models;

public class UserConsent
{
    public Guid UserConsentId { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // e.g. "microphone", "location", "audio_recording", "terms_of_service", "privacy_policy"
    public string ConsentType { get; set; } = null!;

    public bool Granted { get; set; }

    public string ConsentVersion { get; set; } = "1.0";

    public DateTime GrantedAt { get; set; }

    public DateTime? WithdrawnAt { get; set; }
}
