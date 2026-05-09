using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Load User Secrets
builder.Configuration.AddUserSecrets<Program>();

// Add controllers
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// Register your services
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();

var app = builder.Build();

// Map controllers
app.MapControllers();

app.UseHttpsRedirection();

app.Run();
