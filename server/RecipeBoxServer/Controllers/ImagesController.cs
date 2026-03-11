using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBoxServer.Services;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/images")]
[Authorize]
public class ImagesController : ControllerBase
{
    private readonly ICloudinaryService _cloudinary;

    public ImagesController(ICloudinaryService cloudinary)
    {
        _cloudinary = cloudinary;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowed.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only image files are allowed (jpg, png, gif, webp)." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "File size must not exceed 10 MB." });

        try
        {
            var url = await _cloudinary.UploadImageAsync(file);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
