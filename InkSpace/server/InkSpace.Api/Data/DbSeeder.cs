using InkSpace.Api.Models;
using InkSpace.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Category { Name = "Technology", Slug = "technology", Description = "Software, AI and the modern web." },
                new Category { Name = "Design", Slug = "design", Description = "Product, visual and interaction design." },
                new Category { Name = "Career", Slug = "career", Description = "Learning, work and professional growth." },
                new Category { Name = "Culture", Slug = "culture", Description = "Ideas, people and modern culture." }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new User {
                    Username = "admin", Email = "admin@inkspace.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    DisplayName = "InkSpace Admin", Bio = "Platform administrator.", Role = "Admin",
                    AvatarUrl = "https://api.dicebear.com/9.x/initials/svg?seed=InkSpace%20Admin"
                },
                new User {
                    Username = "alex", Email = "alex@inkspace.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Author@123"),
                    DisplayName = "Alex Morgan", Bio = "Writes about software, craft and better digital products.", Role = "Author",
                    AvatarUrl = "https://api.dicebear.com/9.x/initials/svg?seed=Alex%20Morgan"
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.Posts.AnyAsync())
        {
            var author = await db.Users.FirstAsync(x => x.Username == "alex");
            var category = await db.Categories.FirstAsync(x => x.Slug == "technology");
            var tags = new[] { "aspnet", "react", "architecture" }
                .Select(x => new Tag { Name = x, Slug = SlugService.Make(x) }).ToList();
            db.Tags.AddRange(tags);
            await db.SaveChangesAsync();

            var post = new Post {
                Title = "Building products that stay simple as they grow",
                Slug = "building-products-that-stay-simple-as-they-grow",
                Excerpt = "A practical approach to structuring modern web applications without drowning in complexity.",
                ContentHtml = "<h2>Simple is a feature</h2><p>Good architecture makes the next change easier. Start with clear boundaries, predictable data flow, and boring technology that your team understands.</p><blockquote>Optimize for the next developer who reads the code.</blockquote><h2>Build around the domain</h2><p>Keep API contracts explicit, validate at the boundary, and make authorization rules visible. A small system with strong conventions can scale surprisingly far.</p>",
                CoverImageUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80",
                Status = "Published", IsFeatured = true, PublishedAt = DateTime.UtcNow.AddDays(-1),
                AuthorId = author.Id, CategoryId = category.Id, ReadingTimeMinutes = 3
            };
            post.PostTags = tags.Select(t => new PostTag { Post = post, TagId = t.Id }).ToList();
            db.Posts.Add(post);
            await db.SaveChangesAsync();
        }
    }
}
