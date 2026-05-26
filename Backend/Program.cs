using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Load User Secrets
builder.Configuration.AddUserSecrets<Program>();

// Add controllers
builder.Services.AddControllers();

// Allow frontend Expo Web to call this backend locally
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExpoWeb", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8081",
                "http://127.0.0.1:8081",

                // Nän
                // "http://192.168.68.104:8081"
                "http://192.168.8.6:8081"

                // Alexander
                // "http://

                // Farishta
                // "http://
        )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null
            );
        }
    ));

// Register your services
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient<IPushNotificationService, PushNotificationService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowExpoWeb");

// Map controllers
app.MapControllers();

app.Run();
