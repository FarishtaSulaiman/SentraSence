using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SentraSence.Api.Data;
using SentraSence.Api.Models;
using SentraSence.Api.Models.Dto;

namespace SentraSence.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public AuthController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthUserResponse>> GoogleLogin(
        [FromBody] GoogleLoginRequest request
    )
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLower();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user is null)
        {
            return NotFound(new
            {
                message = "No registered user found for this Google account."
            });
        }

        user.Name = request.Name ?? user.Name;
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        {
            user.Name = request.Name ?? user.Name;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
        }

        return Ok(new AuthUserResponse
        {
            UserId = user.UserId,
            Email = user.Email,
            Name = user.Name
        });
    }
}