using InkSpace.Api.Data;
using InkSpace.Api.DTOs;
using InkSpace.Api.Models;
using InkSpace.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email || x.Username == username))
            return Conflict(new { message = "Email or username is already registered." });

        var user = new User {
            Username = username,
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Author",
            AvatarUrl = $"https://api.dicebear.com/9.x/initials/svg?seed={Uri.EscapeDataString(request.DisplayName)}"
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(ToAuth(user, jwt.Create(user)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });
        return Ok(ToAuth(user, jwt.Create(user)));
    }

    private static object ToAuth(User user, string token) => new {
        token,
        user = new { user.Id, user.Username, user.Email, user.DisplayName, user.Bio, user.AvatarUrl, user.Role }
    };
}
