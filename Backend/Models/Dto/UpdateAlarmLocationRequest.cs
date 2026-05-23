namespace SentraSence.Api.Models.Dto;

public class UpdateAlarmLocationRequest
{
    public double Lat { get; set; }
    public double Lon { get; set; }
    public double? Accuracy { get; set; }
}
