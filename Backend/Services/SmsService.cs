using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace SentraSence.Api.Services;

public class SmsService : ISmsService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromNumber;
    private readonly ILogger<SmsService> _logger;

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
    {
        _accountSid = configuration["Twilio:AccountSid"]
            ?? throw new InvalidOperationException("Twilio:AccountSid is not configured.");
        _authToken = configuration["Twilio:AuthToken"]
            ?? throw new InvalidOperationException("Twilio:AuthToken is not configured.");
        _fromNumber = configuration["Twilio:FromNumber"]
            ?? throw new InvalidOperationException("Twilio:FromNumber is not configured.");
        _logger = logger;
    }

    public async Task SendAlarmSmsAsync(string toPhone, string userName, double lat, double lon)
    {
        TwilioClient.Init(_accountSid, _authToken);

        var mapsLink = $"https://maps.google.com/?q={lat.ToString(System.Globalization.CultureInfo.InvariantCulture)},{lon.ToString(System.Globalization.CultureInfo.InvariantCulture)}";
        var body = $"NÖDLARM via SentraSense: {userName} har aktiverat ett nödlarm. Realtidsposition: {mapsLink}";

        var message = await MessageResource.CreateAsync(
            body: body,
            from: new PhoneNumber(_fromNumber),
            to: new PhoneNumber(toPhone)
        );

        _logger.LogInformation("SMS sent to {Phone}, SID: {Sid}", toPhone, message.Sid);
    }
}
