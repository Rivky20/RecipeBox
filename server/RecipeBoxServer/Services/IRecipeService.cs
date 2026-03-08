using RecipeBoxServer.DTOs.Recipes;

namespace RecipeBoxServer.Services;

public interface IRecipeService
{
    Task<IEnumerable<RecipeDto>> GetAllAsync(RecipeQueryDto query, Guid? requestingUserId);
    Task<IEnumerable<RecipeDto>> GetByAlbumAsync(int albumId, Guid? requestingUserId);
    Task<RecipeDto?> GetByIdAsync(int id, Guid? requestingUserId);
    Task<RecipeDto> CreateAsync(CreateRecipeDto dto, Guid userId);
    Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, Guid userId, bool isAdmin);
    Task<bool> DeleteAsync(int id, Guid userId, bool isAdmin);
}