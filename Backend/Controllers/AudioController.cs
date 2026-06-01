using Microsoft.AspNetCore.Mvc;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AudioController : ControllerBase
{
    private readonly AudioService _audioService;

    public AudioController(AudioService audioService)
    {
        _audioService = audioService;
    }

    [HttpGet("history/{userId:guid}")]
    public async Task<IActionResult> GetAudioHistory(Guid userId)
    {
        Console.WriteLine("AudioHistory endpoint HIT with userId: " + userId);
        var items = await _audioService.GetAudioHistoryAsync(userId);
        return Ok(items);
    }
}
