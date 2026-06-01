namespace SentraSence.Api.Services;

public interface IEmailService
{
    Task SendAlarmEmailAsync(string toEmail, string toName, string userName, double lat, double lon);
    Task SendLocationShareEmailAsync(string toEmail, string toName, string userName, double lat, double lon);
}
