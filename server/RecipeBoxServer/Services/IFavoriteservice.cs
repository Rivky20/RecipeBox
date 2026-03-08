using RecipeBoxServer.DTOs.Recipes;

namespace RecipeBoxServer.Services;

public interface IFavoriteService
{
    Task<bool> AddFavoriteAsync(Guid userId, int recipeId);
    Task<bool> RemoveFavoriteAsync(Guid userId, int recipeId);
    Task<IEnumerable<RecipeDto>> GetFavoritesAsync(Guid userId);
}