namespace SentraSence.Api.Models.Dto;

public class AlarmTriggerResponse
{
    public Guid AlarmEventId { get; set; }
    public string Status { get; set; } = null!;
    public int ContactsNotified { get; set; }
    public DateTime StartedAt { get; set; }
}
