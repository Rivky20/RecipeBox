using Microsoft.EntityFrameworkCore;
using RecipeBoxServer.Data;
using RecipeBoxServer.DTOs.Recipes;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.Services;

public class RecipeService : IRecipeService
{
    private readonly RecipeBoxDbContext _db;

    public RecipeService(RecipeBoxDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<RecipeDto>> GetAllAsync(RecipeQueryDto query, Guid? requestingUserId)
    {
        var q = _db.Recipes
            .Include(r => r.Album)
            .Include(r => r.User)
            .Include(r => r.FavoritedBy)
            .AsQueryable();

        if (query.AlbumId.HasValue)
            q = q.Where(r => r.AlbumId == query.AlbumId.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            q = q.Where(r =>
                r.Name.ToLower().Contains(search) ||
                r.Description.ToLower().Contains(search));
        }

        var recipes = await q.ToListAsync();
        return ApplySorting(recipes, query.SortBy, requestingUserId);
    }

    public async Task<IEnumerable<RecipeDto>> GetByAlbumAsync(int albumId, Guid? requestingUserId)
    {
        var recipes = await _db.Recipes
            .Include(r => r.Album)
            .Include(r => r.User)
            .Include(r => r.FavoritedBy)
            .Where(r => r.AlbumId == albumId)
            .ToListAsync();

        // סדר: מתכוני המשתמש → מועדפים → שאר → תאריך
        return ApplySorting(recipes, "date", requestingUserId);
    }

    public async Task<RecipeDto?> GetByIdAsync(int id, Guid? requestingUserId)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Album)
            .Include(r => r.User)
            .Include(r => r.FavoritedBy)
            .FirstOrDefaultAsync(r => r.Id == id);

        return recipe == null ? null : MapToDto(recipe, requestingUserId);
    }

    public async Task<RecipeDto> CreateAsync(CreateRecipeDto dto, Guid userId)
    {
        ValidateRecipeType(dto.RecipeType, dto.Link, dto.Ingredients, dto.Instructions);

        var albumExists = await _db.Albums.AnyAsync(a => a.Id == dto.AlbumId);
        if (!albumExists)
            throw new InvalidOperationException("Album not found.");

        var recipe = new Recipe
        {
            Name = dto.Name,
            Description = dto.Description ?? string.Empty,
            ImagePath = dto.ImagePath,
            RecipeType = dto.RecipeType,
            Link = dto.RecipeType == RecipeType.Link ? dto.Link : null,
            Ingredients = dto.RecipeType == RecipeType.Text ? dto.Ingredients : null,
            Instructions = dto.RecipeType == RecipeType.Text ? dto.Instructions : null,
            AlbumId = dto.AlbumId,
            UserId = userId
        };

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();

        await _db.Entry(recipe).Reference(r => r.Album).LoadAsync();
        await _db.Entry(recipe).Reference(r => r.User).LoadAsync();

        return MapToDto(recipe, userId);
    }

    public async Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, Guid userId, bool isAdmin)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Album)
            .Include(r => r.User)
            .Include(r => r.FavoritedBy)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null) return null;

        if (!isAdmin && recipe.UserId != userId)
            throw new UnauthorizedAccessException("You can only edit your own recipes.");

        ValidateRecipeType(dto.RecipeType, dto.Link, dto.Ingredients, dto.Instructions);

        var albumExists = await _db.Albums.AnyAsync(a => a.Id == dto.AlbumId);
        if (!albumExists)
            throw new InvalidOperationException("Album not found.");

        recipe.Name = dto.Name;
        recipe.Description = dto.Description ?? string.Empty;
        recipe.ImagePath = dto.ImagePath;
        recipe.RecipeType = dto.RecipeType;
        recipe.Link = dto.RecipeType == RecipeType.Link ? dto.Link : null;
        recipe.Ingredients = dto.RecipeType == RecipeType.Text ? dto.Ingredients : null;
        recipe.Instructions = dto.RecipeType == RecipeType.Text ? dto.Instructions : null;
        recipe.AlbumId = dto.AlbumId;

        await _db.SaveChangesAsync();
        await _db.Entry(recipe).Reference(r => r.Album).LoadAsync();

        return MapToDto(recipe, userId);
    }

    public async Task<bool> DeleteAsync(int id, Guid userId, bool isAdmin)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe == null) return false;

        if (!isAdmin && recipe.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own recipes.");

        _db.Recipes.Remove(recipe);
        await _db.SaveChangesAsync();
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static IEnumerable<RecipeDto> ApplySorting(
        List<Recipe> recipes,
        string? sortBy,
        Guid? requestingUserId)
    {
        IEnumerable<Recipe> sorted;

        if (requestingUserId.HasValue)
        {
            var uid = requestingUserId.Value;
            sorted = recipes
                .OrderByDescending(r => r.UserId == uid)
                .ThenByDescending(r => r.FavoritedBy.Any(f => f.UserId == uid))
                .ThenByDescending(r => r.CreatedAt);
        }
        else
        {
            sorted = sortBy?.ToLower() == "name"
                ? recipes.OrderBy(r => r.Name)
                : recipes.OrderByDescending(r => r.CreatedAt);
        }

        return sorted.Select(r => MapToDto(r, requestingUserId));
    }

    private static void ValidateRecipeType(
        RecipeType type,
        string? link,
        string? ingredients,
        string? instructions)
    {
        if (type == RecipeType.Link && string.IsNullOrWhiteSpace(link))
            throw new InvalidOperationException("Link is required for Link-type recipes.");

        if (type == RecipeType.Text &&
            string.IsNullOrWhiteSpace(ingredients) &&
            string.IsNullOrWhiteSpace(instructions))
            throw new InvalidOperationException(
                "Ingredients or Instructions are required for Text-type recipes.");
    }

    private static RecipeDto MapToDto(Recipe recipe, Guid? requestingUserId)
    {
        return new RecipeDto
        {
            Id = recipe.Id,
            Name = recipe.Name,
            Description = recipe.Description,
            ImagePath = recipe.ImagePath,
            RecipeType = recipe.RecipeType,
            Link = recipe.Link,
            Ingredients = recipe.Ingredients,
            Instructions = recipe.Instructions,
            AlbumId = recipe.AlbumId,
            AlbumName = recipe.Album?.Name ?? string.Empty,
            UserId = recipe.UserId,
            UserEmail = recipe.User?.Email ?? string.Empty,
            CreatedAt = recipe.CreatedAt,
            IsFavorite = requestingUserId.HasValue &&
                         recipe.FavoritedBy.Any(f => f.UserId == requestingUserId.Value)
        };
    }
}