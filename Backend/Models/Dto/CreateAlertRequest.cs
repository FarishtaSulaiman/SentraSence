namespace SentraSence.Api.Models.Dto;

public class CreateAlertRequest
{
    public string Latitude { get; set; } = default!;
    public string Longitude { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public DateTime Timestamp { get; set; }
}
