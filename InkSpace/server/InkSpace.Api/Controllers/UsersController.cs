using InkSpace.Api.Data;
using InkSpace.Api.DTOs;
using InkSpace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet("{username}")]
    public async Task<IActionResult> Profile(string username)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Username == username);
        if (user is null) return NotFound();

        var posts = await db.Posts.AsNoTracking().Where(x => x.AuthorId == user.Id && x.Status == "Published")
            .Include(x => x.Category)
            .OrderByDescending(x => x.PublishedAt)
            .Select(x => new {
                x.Id, x.Title, x.Slug, x.Excerpt, x.CoverImageUrl, x.ViewCount, x.ReadingTimeMinutes, x.PublishedAt,
                category = new { x.Category.Name, x.Category.Slug }
            }).ToListAsync();
        return Ok(new {
            user.Username, user.DisplayName, user.Bio, user.AvatarUrl, user.CreatedAt,
            stats = new { posts = posts.Count, views = posts.Sum(x => x.ViewCount) }, posts
        });
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(User.UserId());
        if (user is null) return NotFound();
        user.DisplayName = request.DisplayName.Trim();
        user.Bio = request.Bio?.Trim() ?? "";
        user.AvatarUrl = request.AvatarUrl?.Trim() ?? "";
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Username, user.Email, user.DisplayName, user.Bio, user.AvatarUrl, user.Role });
    }

    [Authorize]
    [HttpGet("me/dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var id = User.UserId();
        var posts = db.Posts.AsNoTracking().Where(x => x.AuthorId == id);
        var publishedIds = posts.Where(x => x.Status == "Published").Select(x => x.Id);
        return Ok(new {
            totalPosts = await posts.CountAsync(),
            published = await posts.CountAsync(x => x.Status == "Published"),
            drafts = await posts.CountAsync(x => x.Status == "Draft"),
            totalViews = await posts.SumAsync(x => (int?)x.ViewCount) ?? 0,
            pendingComments = await db.Comments.CountAsync(x => publishedIds.Contains(x.PostId) && x.Status == "Pending")
        });
    }
}
