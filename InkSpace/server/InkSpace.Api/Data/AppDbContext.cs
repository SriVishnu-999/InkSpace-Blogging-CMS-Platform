using InkSpace.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostTag> PostTags => Set<PostTag>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
        modelBuilder.Entity<Category>().HasIndex(x => x.Slug).IsUnique();
        modelBuilder.Entity<Tag>().HasIndex(x => x.Slug).IsUnique();
        modelBuilder.Entity<Post>().HasIndex(x => x.Slug).IsUnique();

        modelBuilder.Entity<PostTag>().HasKey(x => new { x.PostId, x.TagId });
        modelBuilder.Entity<PostTag>()
            .HasOne(x => x.Post).WithMany(x => x.PostTags)
            .HasForeignKey(x => x.PostId);
        modelBuilder.Entity<PostTag>()
            .HasOne(x => x.Tag).WithMany(x => x.PostTags)
            .HasForeignKey(x => x.TagId);

        modelBuilder.Entity<Post>()
            .HasOne(x => x.Author).WithMany(x => x.Posts)
            .HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Comment>()
            .HasOne(x => x.User).WithMany(x => x.Comments)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
