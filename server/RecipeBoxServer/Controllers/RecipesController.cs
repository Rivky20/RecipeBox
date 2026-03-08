using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBoxServer.DTOs.Recipes;
using RecipeBoxServer.Services;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/recipes")]
public class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;

    public RecipesController(IRecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAll([FromQuery] RecipeQueryDto query)
    {
        var userId = GetCurrentUserId();
        var recipes = await _recipeService.GetAllAsync(query, userId);
        return Ok(recipes);
    }

    [HttpGet("album/{albumId:int}")]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetByAlbum(int albumId)
    {
        var userId = GetCurrentUserId();
        var recipes = await _recipeService.GetByAlbumAsync(albumId, userId);
        return Ok(recipes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecipeDto>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        var recipe = await _recipeService.GetByIdAsync(id, userId);
        if (recipe == null) return NotFound();
        return Ok(recipe);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<RecipeDto>> Create([FromBody] CreateRecipeDto dto)
    {
        var userId = GetCurrentUserIdRequired();
        try
        {
            var recipe = await _recipeService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<ActionResult<RecipeDto>> Update(int id, [FromBody] UpdateRecipeDto dto)
    {
        var userId = GetCurrentUserIdRequired();
        var isAdmin = User.IsInRole("Admin");
        try
        {
            var recipe = await _recipeService.UpdateAsync(id, dto, userId, isAdmin);
            if (recipe == null) return NotFound();
            return Ok(recipe);
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserIdRequired();
        var isAdmin = User.IsInRole("Admin");
        try
        {
            var deleted = await _recipeService.DeleteAsync(id, userId, isAdmin);
            if (!deleted) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private Guid GetCurrentUserIdRequired()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(claim, out var id))
            throw new InvalidOperationException("User ID not found in token.");
        return id;
    }
}