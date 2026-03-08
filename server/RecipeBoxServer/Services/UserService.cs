using Microsoft.EntityFrameworkCore;
using RecipeBoxServer.Data;
using RecipeBoxServer.DTOs.Admin;
using RecipeBoxServer.DTOs.Users;

namespace RecipeBoxServer.Services;

public class UserService : IUserService
{
    private readonly RecipeBoxDbContext _db;

    public UserService(RecipeBoxDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        return await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                Role = u.Role,
                IsBlocked = u.IsBlocked,
                CreatedAt = u.CreatedAt,
                RecipeCount = u.Recipes.Count
            })
            .ToListAsync();
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.Recipes)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            IsBlocked = user.IsBlocked,
            CreatedAt = user.CreatedAt,
            RecipeCount = user.Recipes.Count
        };
    }

    public async Task<bool> BlockUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;

        user.IsBlocked = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnblockUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;

        user.IsBlocked = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<SystemStatsDto> GetStatsAsync()
    {
        var recentRecipes = await _db.Recipes
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
            .Select(r => new RecentRecipeDto
            {
                RecipeId = r.Id,
                RecipeName = r.Name,
                UserEmail = r.User.Email,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new SystemStatsDto
        {
            TotalUsers = await _db.Users.CountAsync(),
            TotalRecipes = await _db.Recipes.CountAsync(),
            TotalAlbums = await _db.Albums.CountAsync(),
            BlockedUsers = await _db.Users.CountAsync(u => u.IsBlocked),
            RecentRecipes = recentRecipes
        };
    }
}