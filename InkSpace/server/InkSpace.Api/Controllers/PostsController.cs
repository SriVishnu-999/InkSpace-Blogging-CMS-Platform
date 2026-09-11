using System.Security.Claims;
using Ganss.Xss;
using InkSpace.Api.Data;
using InkSpace.Api.DTOs;
using InkSpace.Api.Models;
using InkSpace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        int page = 1, int pageSize = 9, string? search = null, string? category = null,
        string? tag = null, string? author = null, string sort = "latest")
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 30);
        var q = db.Posts.AsNoTracking()
            .Where(x => x.Status == "Published")
            .Include(x => x.Author).Include(x => x.Category)
            .Include(x => x.PostTags).ThenInclude(x => x.Tag).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(x => x.Title.Contains(s) || x.Excerpt.Contains(s) || x.ContentHtml.Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(x => x.Category.Slug == category);
        if (!string.IsNullOrWhiteSpace(tag)) q = q.Where(x => x.PostTags.Any(pt => pt.Tag.Slug == tag));
        if (!string.IsNullOrWhiteSpace(author)) q = q.Where(x => x.Author.Username == author);

        q = sort == "popular" ? q.OrderByDescending(x => x.ViewCount) :
            q.OrderByDescending(x => x.IsFeatured).ThenByDescending(x => x.PublishedAt);

        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).Select(x => new {
            x.Id, x.Title, x.Slug, x.Excerpt, x.CoverImageUrl, x.IsFeatured, x.ViewCount,
            x.ReadingTimeMinutes, x.PublishedAt,
            category = new { x.Category.Name, x.Category.Slug },
            author = new { x.Author.Username, x.Author.DisplayName, x.Author.AvatarUrl },
            tags = x.PostTags.Select(pt => new { pt.Tag.Name, pt.Tag.Slug })
        }).ToListAsync();

        return Ok(new { items, page, pageSize, total, totalPages = (int)Math.Ceiling(total / (double)pageSize) });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetOne(string slug)
    {
        var post = await db.Posts
            .Include(x => x.Author).Include(x => x.Category)
            .Include(x => x.PostTags).ThenInclude(x => x.Tag)
            .FirstOrDefaultAsync(x => x.Slug == slug && x.Status == "Published");
        if (post is null) return NotFound();

        post.ViewCount++;
        await db.SaveChangesAsync();

        return Ok(new {
            post.Id, post.Title, post.Slug, post.Excerpt, post.ContentHtml, post.CoverImageUrl,
            post.ViewCount, post.ReadingTimeMinutes, post.PublishedAt,
            category = new { post.Category.Id, post.Category.Name, post.Category.Slug },
            author = new { post.Author.Id, post.Author.Username, post.Author.DisplayName, post.Author.Bio, post.Author.AvatarUrl },
            tags = post.PostTags.Select(pt => new { pt.Tag.Name, pt.Tag.Slug })
        });
    }

    [Authorize]
    [HttpGet("mine/all")]
    public async Task<IActionResult> Mine()
    {
        var userId = User.UserId();
        var items = await db.Posts.AsNoTracking()
            .Where(x => x.AuthorId == userId)
            .Include(x => x.Category).Include(x => x.PostTags).ThenInclude(x => x.Tag)
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new {
                x.Id, x.Title, x.Slug, x.Excerpt, x.CoverImageUrl, x.Status, x.ViewCount,
                x.ReadingTimeMinutes, x.CreatedAt, x.UpdatedAt, x.PublishedAt, x.CategoryId,
                category = new { x.Category.Name, x.Category.Slug },
                tags = x.PostTags.Select(pt => pt.Tag.Name)
            }).ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpGet("mine/{id:int}")]
    public async Task<IActionResult> MineById(int id)
    {
        var userId = User.UserId();
        var isAdmin = User.IsInRole("Admin");
        var x = await db.Posts.AsNoTracking().Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == id && (p.AuthorId == userId || isAdmin));
        if (x is null) return NotFound();
        return Ok(new {
            x.Id, x.Title, x.Excerpt, x.ContentHtml, x.CoverImageUrl, x.Status, x.IsFeatured, x.CategoryId,
            tags = x.PostTags.Select(pt => pt.Tag.Name)
        });
    }

    [Authorize(Roles = "Author,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(SavePostRequest request)
    {
        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId))
            return BadRequest(new { message = "Invalid category." });

        var sanitizer = new HtmlSanitizer();
        var safeHtml = sanitizer.Sanitize(request.ContentHtml);
        var baseSlug = SlugService.Make(request.Title);
        var slug = baseSlug;
        var suffix = 2;
        while (await db.Posts.AnyAsync(x => x.Slug == slug)) slug = $"{baseSlug}-{suffix++}";

        var post = new Post {
            Title = request.Title.Trim(), Slug = slug,
            ContentHtml = safeHtml,
            Excerpt = MakeExcerpt(request.Excerpt, safeHtml),
            CoverImageUrl = request.CoverImageUrl?.Trim() ?? "",
            Status = NormalizeStatus(request.Status),
            IsFeatured = User.IsInRole("Admin") && request.IsFeatured,
            AuthorId = User.UserId(), CategoryId = request.CategoryId,
            ReadingTimeMinutes = ReadingTime(safeHtml),
            PublishedAt = NormalizeStatus(request.Status) == "Published" ? DateTime.UtcNow : null
        };
        await SetTags(post, request.Tags);
        db.Posts.Add(post);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { slug = post.Slug }, new { post.Id, post.Slug });
    }

    [Authorize(Roles = "Author,Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SavePostRequest request)
    {
        var post = await db.Posts.Include(x => x.PostTags).FirstOrDefaultAsync(x => x.Id == id);
        if (post is null) return NotFound();
        if (post.AuthorId != User.UserId() && !User.IsInRole("Admin")) return Forbid();
        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId))
            return BadRequest(new { message = "Invalid category." });

        var sanitizer = new HtmlSanitizer();
        var safeHtml = sanitizer.Sanitize(request.ContentHtml);
        var wasPublished = post.Status == "Published";
        post.Title = request.Title.Trim();
        post.ContentHtml = safeHtml;
        post.Excerpt = MakeExcerpt(request.Excerpt, safeHtml);
        post.CoverImageUrl = request.CoverImageUrl?.Trim() ?? "";
        post.CategoryId = request.CategoryId;
        post.Status = NormalizeStatus(request.Status);
        post.IsFeatured = User.IsInRole("Admin") && request.IsFeatured;
        post.ReadingTimeMinutes = ReadingTime(safeHtml);
        post.UpdatedAt = DateTime.UtcNow;
        if (!wasPublished && post.Status == "Published") post.PublishedAt = DateTime.UtcNow;
        await SetTags(post, request.Tags);
        await db.SaveChangesAsync();
        return Ok(new { post.Id, post.Slug });
    }

    [Authorize(Roles = "Author,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var post = await db.Posts.FirstOrDefaultAsync(x => x.Id == id);
        if (post is null) return NotFound();
        if (post.AuthorId != User.UserId() && !User.IsInRole("Admin")) return Forbid();
        db.Posts.Remove(post);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task SetTags(Post post, List<string>? names)
    {
        post.PostTags.Clear();
        foreach (var raw in (names ?? []).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).Take(8))
        {
            var name = raw.Trim().ToLowerInvariant();
            var slug = SlugService.Make(name);
            var tag = await db.Tags.FirstOrDefaultAsync(x => x.Slug == slug);
            if (tag is null) { tag = new Tag { Name = name, Slug = slug }; db.Tags.Add(tag); }
            post.PostTags.Add(new PostTag { Post = post, Tag = tag });
        }
    }

    private static string NormalizeStatus(string? status) =>
        string.Equals(status, "Published", StringComparison.OrdinalIgnoreCase) ? "Published" : "Draft";

    private static int ReadingTime(string html)
    {
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", " ");
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        return Math.Max(1, (int)Math.Ceiling(words / 220d));
    }

    private static string MakeExcerpt(string? supplied, string html)
    {
        if (!string.IsNullOrWhiteSpace(supplied)) return supplied.Trim()[..Math.Min(supplied.Trim().Length, 260)];
        var text = System.Net.WebUtility.HtmlDecode(System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", " "));
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ").Trim();
        return text[..Math.Min(text.Length, 220)];
    }
}
