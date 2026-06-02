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
        using var content = JsonContent.Create(payload);

        try
        {
            _logger.LogInformation(
                "Sending Expo push notification. Title: {Title}, Body: {Body}",
                title,
                body
            );

            var response = await _httpClient.PostAsync(ExpoPushApiUrl, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"[PUSH] Expo status: {(int)response.StatusCode} {response.StatusCode}");
            Console.WriteLine($"[PUSH] Expo response body: {responseBody}");

            _logger.LogInformation(
                "Expo push response. StatusCode: {StatusCode}. Response: {Response}",
                response.StatusCode,
                responseBody
            );

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Expo push notification request failed. StatusCode: {StatusCode}. Response: {Response}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PUSH] Expo push failed: {ex}");
            _logger.LogError(ex, "An error occurred while sending Expo push notification.");
        }
    }

    public async Task SendPushNotificationsToUserAsync(
        Guid userId,
        string title,
        string body,
        object? data = null)
    {
        Console.WriteLine($"[PUSH] Sending push to user: {userId}");

        var tokens = await _dbContext.PushNotificationTokens
            .Where(token => token.UserId == userId)
            .Select(token => token.Token)
            .ToListAsync();

        Console.WriteLine($"[PUSH] Found {tokens.Count} token(s)");

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