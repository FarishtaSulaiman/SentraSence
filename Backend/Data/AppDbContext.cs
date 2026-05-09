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
    public DbSet<TrustedContact> TrustedContacts => Set<TrustedContact>();
    public DbSet<AiAnalysis> AiAnalyses => Set<AiAnalysis>();
   
    
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
    }
}
