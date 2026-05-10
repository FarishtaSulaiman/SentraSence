namespace SentraSence.Api.Models;

public class User
{
    public Guid UserId { get; set; }

    public string Email { get; set; } = null!;
    public string? Name { get; set; }
    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Codeword (TODO: kryptera i produktion)
    public string? Codeword { get; set; }
    public bool CodewordTrained { get; set; } = false;

    // Navigation
    public ICollection<TrustedContact> TrustedContacts { get; set; } = new List<TrustedContact>();
    public ICollection<AudioClip> AudioClips { get; set; } = new List<AudioClip>();
    public ICollection<AlarmEvent> AlarmEvents { get; set; } = new List<AlarmEvent>();
    public ICollection<UserConsent> Consents { get; set; } = new List<UserConsent>();
}