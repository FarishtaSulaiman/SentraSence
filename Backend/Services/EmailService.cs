using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SentraSence.Api.Services;

public class EmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _username;
    private readonly string _password;
    private readonly string _fromName;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _host     = configuration["Email:Host"]     ?? throw new InvalidOperationException("Email:Host is not configured.");
        _port     = int.Parse(configuration["Email:Port"] ?? "587");
        _username = configuration["Email:Username"] ?? throw new InvalidOperationException("Email:Username is not configured.");
        _password = configuration["Email:Password"] ?? throw new InvalidOperationException("Email:Password is not configured.");
        _fromName = configuration["Email:FromName"] ?? "SentraSense";
        _logger   = logger;
    }

    public async Task SendAlarmEmailAsync(string toEmail, string toName, string userName, double lat, double lon)
    {
        var mapsLink = $"https://maps.google.com/?q={lat.ToString(System.Globalization.CultureInfo.InvariantCulture)},{lon.ToString(System.Globalization.CultureInfo.InvariantCulture)}";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _username));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"🚨 NÖDLARM – {userName} behöver hjälp!";

        message.Body = new TextPart("html")
        {
            Text = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#08141D;color:#FFFFFF;border-radius:12px;padding:32px;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="font-size:48px;">🚨</span>
                <h1 style="color:#E63946;font-size:24px;margin:8px 0;">NÖDLARM AKTIVERAT</h1>
                <p style="color:#8FB8C4;font-size:14px;">via SentraSense</p>
              </div>

              <p style="font-size:16px;line-height:1.6;">
                <strong style="color:#FFFFFF;">{userName}</strong> har aktiverat ett nödlarm och kan behöva hjälp.
              </p>

              <div style="background:#122030;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
                <p style="color:#8FB8C4;font-size:13px;margin:0 0 12px;">Realtidsposition</p>
                <a href="{mapsLink}"
                   style="display:inline-block;background:#00D8E6;color:#08141D;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;">
                  📍 Öppna i Google Maps
                </a>
                <p style="color:#4A6070;font-size:11px;margin:12px 0 0;">
                  Koordinater: {lat.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {lon.ToString(System.Globalization.CultureInfo.InvariantCulture)}
                </p>
              </div>

              <p style="color:#8FB8C4;font-size:13px;line-height:1.6;">
                Kontakta {userName} omedelbart eller ring SOS 112 om situationen är allvarlig.
              </p>

              <hr style="border:none;border-top:1px solid #122030;margin:24px 0;" />
              <p style="color:#4A6070;font-size:11px;text-align:center;">
                Det här meddelandet skickades automatiskt av SentraSense säkerhetsapp.
              </p>
            </div>
            """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_username, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Alarm email sent to {Email}", toEmail);
    }

    public async Task SendLocationShareEmailAsync(string toEmail, string toName, string userName, double lat, double lon)
    {
        var mapsLink = $"https://maps.google.com/?q={lat.ToString(System.Globalization.CultureInfo.InvariantCulture)},{lon.ToString(System.Globalization.CultureInfo.InvariantCulture)}";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _username));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"📍 {userName} delar sin plats med dig";

        message.Body = new TextPart("html")
        {
            Text = $"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#08141D;color:#FFFFFF;border-radius:12px;padding:32px;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="font-size:48px;">📍</span>
                <h1 style="color:#00D8E6;font-size:24px;margin:8px 0;">Platsdelning</h1>
                <p style="color:#8FB8C4;font-size:14px;">via SentraSense</p>
              </div>

              <p style="font-size:16px;line-height:1.6;">
                <strong style="color:#FFFFFF;">{userName}</strong> delar sin nuvarande plats med dig.
              </p>

              <div style="background:#122030;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
                <p style="color:#8FB8C4;font-size:13px;margin:0 0 12px;">Nuvarande position</p>
                <a href="{mapsLink}"
                   style="display:inline-block;background:#00D8E6;color:#08141D;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;">
                  📍 Öppna i Google Maps
                </a>
                <p style="color:#4A6070;font-size:11px;margin:12px 0 0;">
                  Koordinater: {lat.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {lon.ToString(System.Globalization.CultureInfo.InvariantCulture)}
                </p>
              </div>

              <hr style="border:none;border-top:1px solid #122030;margin:24px 0;" />
              <p style="color:#4A6070;font-size:11px;text-align:center;">
                Det här meddelandet skickades automatiskt av SentraSense säkerhetsapp.
              </p>
            </div>
            """
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_username, _password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Location share email sent to {Email}", toEmail);
    }
}
