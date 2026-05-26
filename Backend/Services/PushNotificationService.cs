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

        var message = new
        {
            to = expoPushToken,
            sound = "default",
            title,
            body,
            data = data ?? new { }
        };

        var payload = new[] { message };

        try
        {
            _logger.LogInformation(
                "Sending Expo push notification. Token: {Token}, Title: {Title}, Body: {Body}",
                expoPushToken,
                title,
                body
            );

            var response = await _httpClient.PostAsJsonAsync(ExpoPushApiUrl, payload);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "Expo push response. StatusCode: {StatusCode}. Response: {Response}",
                response.StatusCode,
                responseContent
            );

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Expo push notification request failed. StatusCode: {StatusCode}. Response: {Response}",
                    response.StatusCode,
                    responseContent
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