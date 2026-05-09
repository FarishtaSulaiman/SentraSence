namespace SentraSence.Api.Models;

public class AlarmLocation
{
    public Guid AlarmLocationId { get; set; }

    public Guid AlarmEventId { get; set; }
    public AlarmEvent AlarmEvent { get; set; } = null!;

    public double Lat { get; set; }
    public double Lon { get; set; }

    public DateTime CapturedAt { get; set; }

    public double? Accuracy { get; set; }
}