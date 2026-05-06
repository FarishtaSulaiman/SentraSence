using Microsoft.AspNetCore.Http;

namespace SentraSence.Api.Services;

public interface IBlobStorageService
{
    Task<string> UploadAlertAudioAsync(IFormFile file, CancellationToken cancellationToken = default);
}
