using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;

namespace SentraSence.Api.Services;

public class PushNotificationService : IPushNotificationService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<PushNotificationService> _logger;

    private const string ExpoPushApiUrl = "https://exp.host/--/api/v2/push/send";

    public PushNotificationService(
        HttpClient httpClient,
        AppDbContext dbContext,
        ILogger<PushNotificationService> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SendPushNotificationAsync(
        string expoPushToken,
        string title,
        string body,
        object? data = null)
    {
        if (string.IsNullOrWhiteSpace(expoPushToken))
        {
            _logger.LogWarning("Push notification could not be sent because the Expo push token was empty.");
            return;
        }

        var payload = new
        {
            to = expoPushToken,
            sound = "default",
            title,
            body,
            data
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync(ExpoPushApiUrl, payload);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();

                _logger.LogWarning(
                    "Expo push notification request failed. StatusCode: {StatusCode}. Response: {Response}",
                    response.StatusCode,
                    errorContent
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while sending Expo push notification.");
        }
    }

    public async Task SendPushNotificationsToUserAsync(
        Guid userId,
        string title,
        string body,
        object? data = null)
    {
        var tokens = await _dbContext.PushNotificationTokens
            .Where(token => token.UserId == userId)
            .Select(token => token.Token)
            .ToListAsync();

        if (tokens.Count == 0)
        {
            _logger.LogInformation(
                "No push notification tokens found for user {UserId}. No notification was sent.",
                userId
            );

            return;
        }

        foreach (var token in tokens)
        {
            await SendPushNotificationAsync(token, title, body, data);
        }
    }
}