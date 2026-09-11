using System.ComponentModel.DataAnnotations;

namespace InkSpace.Api.DTOs;

public record RegisterRequest(
    [Required, MinLength(3), MaxLength(30)] string Username,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required, MaxLength(60)] string DisplayName);

public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);

public record UpdateProfileRequest(
    [Required, MaxLength(60)] string DisplayName,
    [MaxLength(300)] string Bio,
    string AvatarUrl);

public record SavePostRequest(
    [Required, MaxLength(180)] string Title,
    [Required] string ContentHtml,
    [Required] int CategoryId,
    string? Excerpt,
    string? CoverImageUrl,
    List<string>? Tags,
    string Status = "Draft",
    bool IsFeatured = false);

public record CreateCommentRequest([Required, MinLength(2), MaxLength(1500)] string Body);

public record ModerateCommentRequest([Required] string Status);
