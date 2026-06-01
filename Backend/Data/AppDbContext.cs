using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Models;

namespace SentraSence.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<AudioClip> AudioClips => Set<AudioClip>();
    public DbSet<AlarmEvent> AlarmEvents => Set<AlarmEvent>();
    public DbSet<AlarmLocation> AlarmLocations => Set<AlarmLocation>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();
    public DbSet<TrustedContact> TrustedContacts => Set<TrustedContact>();
    public DbSet<AiAnalysis> AiAnalyses => Set<AiAnalysis>();
    public DbSet<UserConsent> UserConsents => Set<UserConsent>();
    public DbSet<PushNotificationToken> PushNotificationTokens => Set<PushNotificationToken>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Här kan du lägga relationsregler senare om det behövs
        // t.ex. modelBuilder.Entity<User>().HasMany(u => u.AudioClips)...
        modelBuilder.Entity<Notification>()
    .HasOne(n => n.TrustedContact)
    .WithMany()
    .HasForeignKey(n => n.TrustedContactId)
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<PushNotificationToken>()
    .HasOne(p => p.User)
    .WithMany(u => u.PushNotificationTokens)
    .HasForeignKey(p => p.UserId)
    .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<PushNotificationToken>()
        .HasIndex(p => p.Token)
        .IsUnique();

    modelBuilder.Entity<PushNotificationToken>()
        .Property(p => p.Token)
        .HasMaxLength(512);

    modelBuilder.Entity<PushNotificationToken>()
        .Property(p => p.Platform)
        .HasMaxLength(50);

    modelBuilder.Entity<UserNotification>()
        .HasOne(n => n.User)
        .WithMany()
        .HasForeignKey(n => n.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<UserNotification>()
        .HasOne(n => n.AlarmEvent)
        .WithMany()
        .HasForeignKey(n => n.AlarmEventId)
        .OnDelete(DeleteBehavior.SetNull);

    modelBuilder.Entity<UserNotification>()
        .Property(n => n.Title)
        .HasMaxLength(100);

    modelBuilder.Entity<UserNotification>()
        .Property(n => n.Message)
        .HasMaxLength(500);

    modelBuilder.Entity<UserNotification>()
        .Property(n => n.Type)
        .HasMaxLength(50);
    }
}
