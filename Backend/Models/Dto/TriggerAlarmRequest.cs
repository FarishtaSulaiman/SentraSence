namespace SentraSence.Api.Models.Dto;

public class TriggerAlarmRequest
{
    public Guid UserId { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }
    public string TriggerType { get; set; } = "Manual";
}
