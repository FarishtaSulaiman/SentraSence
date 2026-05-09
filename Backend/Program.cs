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
            .WithOrigins("http://localhost:8081")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// Register your services
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();

var app = builder.Build();

app.UseCors("AllowExpoWeb");

// Map controllers
app.MapControllers();

app.UseHttpsRedirection();

app.Run();
