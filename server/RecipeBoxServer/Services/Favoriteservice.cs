using Microsoft.EntityFrameworkCore;
using RecipeBoxServer.Data;
using RecipeBoxServer.DTOs.Recipes;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.Services;

public class FavoriteService : IFavoriteService
{
    private readonly RecipeBoxDbContext _db;

    public FavoriteService(RecipeBoxDbContext db)
    {
        _db = db;
    }

    public async Task<bool> AddFavoriteAsync(Guid userId, int recipeId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new InvalidOperationException("User not found.");

        var recipeExists = await _db.Recipes.AnyAsync(r => r.Id == recipeId);
        if (!recipeExists)
            throw new InvalidOperationException("Recipe not found.");

        // מניעת כפילויות
        var alreadyFavorited = await _db.UserFavorites
            .AnyAsync(uf => uf.UserId == userId && uf.RecipeId == recipeId);

        if (alreadyFavorited)
            return false;

        _db.UserFavorites.Add(new UserFavorite
        {
            UserId = userId,
            RecipeId = recipeId,
            AddedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFavoriteAsync(Guid userId, int recipeId)
    {
        var favorite = await _db.UserFavorites
            .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.RecipeId == recipeId);

        if (favorite == null) return false;

        _db.UserFavorites.Remove(favorite);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<RecipeDto>> GetFavoritesAsync(Guid userId)
    {
        var favorites = await _db.UserFavorites
            .Where(uf => uf.UserId == userId)
            .Include(uf => uf.Recipe).ThenInclude(r => r.Album)
            .Include(uf => uf.Recipe).ThenInclude(r => r.User)
            .Include(uf => uf.Recipe).ThenInclude(r => r.FavoritedBy)
            .OrderByDescending(uf => uf.AddedAt)
            .ToListAsync();

        return favorites.Select(uf => new RecipeDto
        {
            Id = uf.Recipe.Id,
            Name = uf.Recipe.Name,
            Description = uf.Recipe.Description,
            ImagePath = uf.Recipe.ImagePath,
            RecipeType = uf.Recipe.RecipeType,
            Link = uf.Recipe.Link,
            Ingredients = uf.Recipe.Ingredients,
            Instructions = uf.Recipe.Instructions,
            AlbumId = uf.Recipe.AlbumId,
            AlbumName = uf.Recipe.Album?.Name ?? string.Empty,
            UserId = uf.Recipe.UserId,
            UserEmail = uf.Recipe.User?.Email ?? string.Empty,
            CreatedAt = uf.Recipe.CreatedAt,
            IsFavorite = true
        });
    }
}