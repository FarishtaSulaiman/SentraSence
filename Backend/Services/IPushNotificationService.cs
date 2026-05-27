namespace SentraSence.Api.Services;

public interface IPushNotificationService
{
    Task SendPushNotificationAsync(
        string expoPushToken,
        string title,
        string body,
        object? data = null
    );

    Task SendPushNotificationsToUserAsync(
        Guid userId,
        string title,
        string body,
        object? data = null
    );
}