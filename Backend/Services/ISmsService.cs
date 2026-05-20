namespace SentraSence.Api.Services;

public interface ISmsService
{
    Task SendAlarmSmsAsync(string toPhone, string userName, double lat, double lon);
}
