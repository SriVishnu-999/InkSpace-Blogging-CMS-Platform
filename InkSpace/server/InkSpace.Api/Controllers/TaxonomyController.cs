using InkSpace.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InkSpace.Api.Controllers;

[ApiController]
[Route("api")]
public class TaxonomyController(AppDbContext db) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<IActionResult> Categories() => Ok(await db.Categories.AsNoTracking()
        .OrderBy(x => x.Name).Select(x => new { x.Id, x.Name, x.Slug, x.Description }).ToListAsync());

    [HttpGet("tags")]
    public async Task<IActionResult> Tags() => Ok(await db.Tags.AsNoTracking()
        .OrderByDescending(x => x.PostTags.Count).Take(30)
        .Select(x => new { x.Id, x.Name, x.Slug, count = x.PostTags.Count }).ToListAsync());
}
