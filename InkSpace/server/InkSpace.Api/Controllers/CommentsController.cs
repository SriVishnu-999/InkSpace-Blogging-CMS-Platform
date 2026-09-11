using InkSpace.Api.Data;
using InkSpace.Api.DTOs;
using InkSpace.Api.Models;
using InkSpace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Controllers;

[ApiController]
[Route("api/comments")]
public class CommentsController(AppDbContext db) : ControllerBase
{
    [HttpGet("post/{postId:int}")]
    public async Task<IActionResult> ForPost(int postId)
    {
        var items = await db.Comments.AsNoTracking()
            .Where(x => x.PostId == postId && x.Status == "Approved")
            .Include(x => x.User).OrderByDescending(x => x.CreatedAt)
            .Select(x => new { x.Id, x.Body, x.CreatedAt, user = new { x.User.Username, x.User.DisplayName, x.User.AvatarUrl } })
            .ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpPost("post/{postId:int}")]
    public async Task<IActionResult> Create(int postId, CreateCommentRequest request)
    {
        if (!await db.Posts.AnyAsync(x => x.Id == postId && x.Status == "Published")) return NotFound();
        var comment = new Comment { PostId = postId, UserId = User.UserId(), Body = request.Body.Trim(), Status = "Pending" };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();
        return Ok(new { message = "Comment submitted for moderation.", comment.Id });
    }

    [Authorize(Roles = "Author,Admin")]
    [HttpGet("pending")]
    public async Task<IActionResult> Pending()
    {
        var userId = User.UserId();
        var isAdmin = User.IsInRole("Admin");
        var q = db.Comments.AsNoTracking().Where(x => x.Status == "Pending")
            .Include(x => x.User).Include(x => x.Post).AsQueryable();
        if (!isAdmin) q = q.Where(x => x.Post.AuthorId == userId);

        var items = await q.OrderBy(x => x.CreatedAt)
            .Select(x => new {
                x.Id, x.Body, x.CreatedAt,
                user = new { x.User.Username, x.User.DisplayName, x.User.AvatarUrl },
                post = new { x.Post.Id, x.Post.Title, x.Post.Slug }
            }).ToListAsync();
        return Ok(items);
    }

    [Authorize(Roles = "Author,Admin")]
    [HttpPatch("{id:int}/moderate")]
    public async Task<IActionResult> Moderate(int id, ModerateCommentRequest request)
    {
        var comment = await db.Comments.Include(x => x.Post).FirstOrDefaultAsync(x => x.Id == id);
        if (comment is null) return NotFound();
        if (!User.IsInRole("Admin") && comment.Post.AuthorId != User.UserId()) return Forbid();

        var status = request.Status.Trim();
        if (status is not ("Approved" or "Rejected")) return BadRequest(new { message = "Use Approved or Rejected." });
        comment.Status = status;
        comment.ModeratedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { comment.Id, comment.Status });
    }
}
