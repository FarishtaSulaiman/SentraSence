public class AudioUploadDto
{
    public Guid UserId { get; set; }
    public string AudioUrl { get; set; } = null!;
    public double DurationMs { get; set; }
    public long FileSizeBytes { get; set; }
    public string? DeviceId { get; set; }
}