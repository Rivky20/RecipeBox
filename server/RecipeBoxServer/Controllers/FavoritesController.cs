using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBoxServer.DTOs.Favorites;
using RecipeBoxServer.DTOs.Recipes;
using RecipeBoxServer.Services;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/users/{userId:guid}/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetFavorites(Guid userId)
    {
        if (!CanAccessUser(userId)) return Forbid();
        var favorites = await _favoriteService.GetFavoritesAsync(userId);
        return Ok(favorites);
    }

    [HttpPost]
    public async Task<IActionResult> AddFavorite(Guid userId, [FromBody] AddFavoriteDto dto)
    {
        if (!CanAccessUser(userId)) return Forbid();
        try
        {
            var added = await _favoriteService.AddFavoriteAsync(userId, dto.RecipeId);
            if (!added) return Conflict(new { message = "Recipe is already in favorites." });
            return Ok(new { message = "Added to favorites." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{recipeId:int}")]
    public async Task<IActionResult> RemoveFavorite(Guid userId, int recipeId)
    {
        if (!CanAccessUser(userId)) return Forbid();
        var removed = await _favoriteService.RemoveFavoriteAsync(userId, recipeId);
        if (!removed) return NotFound(new { message = "Favorite not found." });
        return NoContent();
    }

    private bool CanAccessUser(Guid userId)
    {
        var currentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(currentIdStr, out var currentId)) return false;
        return currentId == userId || User.IsInRole("Admin");
    }
}