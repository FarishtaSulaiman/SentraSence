namespace SentraSence.Api.Models.Dto;

public class ShareLocationRequest
{
    public Guid UserId { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }
}
