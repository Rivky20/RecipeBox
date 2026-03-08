using RecipeBoxServer.DTOs.Admin;
using RecipeBoxServer.DTOs.Users;

namespace RecipeBoxServer.Services;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(Guid id);
    Task<bool> BlockUserAsync(Guid id);
    Task<bool> UnblockUserAsync(Guid id);
    Task<SystemStatsDto> GetStatsAsync();
}