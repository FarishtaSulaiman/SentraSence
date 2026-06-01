namespace SentraSence.Api.DTOs;

public class AudioHistoryItemDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}