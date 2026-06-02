using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.DTOs;
using SentraSence.Api.Models;

public class AudioService
{
    private readonly AppDbContext _db;

    public AudioService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AudioHistoryItemDto>> GetAudioHistoryAsync(Guid userId)
    {
        return await _db.AudioClips
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.RecordedAt)
            .Select(x => new AudioHistoryItemDto
        {
            Id = x.AudioClipId,
            Url = x.StorageUrl,
            CreatedAt = x.RecordedAt
        })
            .ToListAsync();
    }
}
