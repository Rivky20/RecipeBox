using Microsoft.EntityFrameworkCore;
using RecipeBoxServer.Data;
using RecipeBoxServer.DTOs.Albums;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.Services;

public class AlbumService : IAlbumService
{
    private readonly RecipeBoxDbContext _db;

    public AlbumService(RecipeBoxDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<AlbumDto>> GetAllAsync()
    {
        return await _db.Albums
            .Include(a => a.Recipes)
            .OrderBy(a => a.Name)
            .Select(a => new AlbumDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                ImagePath = a.ImagePath,
                CreatedAt = a.CreatedAt,
                RecipeCount = a.Recipes.Count
            })
            .ToListAsync();
    }

    public async Task<AlbumDto?> GetByIdAsync(int id)
    {
        var album = await _db.Albums
            .Include(a => a.Recipes)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (album == null) return null;

        return new AlbumDto
        {
            Id = album.Id,
            Name = album.Name,
            Description = album.Description,
            ImagePath = album.ImagePath,
            CreatedAt = album.CreatedAt,
            RecipeCount = album.Recipes.Count
        };
    }

    public async Task<AlbumDto> CreateAsync(CreateAlbumDto dto)
    {
        var album = new Album
        {
            Name = dto.Name,
            Description = dto.Description ?? string.Empty,
            ImagePath = dto.ImagePath
        };

        _db.Albums.Add(album);
        await _db.SaveChangesAsync();

        return new AlbumDto
        {
            Id = album.Id,
            Name = album.Name,
            Description = album.Description,
            ImagePath = album.ImagePath,
            CreatedAt = album.CreatedAt,
            RecipeCount = 0
        };
    }

    public async Task<AlbumDto?> UpdateAsync(int id, UpdateAlbumDto dto)
    {
        var album = await _db.Albums.FindAsync(id);
        if (album == null) return null;

        album.Name = dto.Name;
        album.Description = dto.Description ?? string.Empty;
        album.ImagePath = dto.ImagePath;

        await _db.SaveChangesAsync();

        return new AlbumDto
        {
            Id = album.Id,
            Name = album.Name,
            Description = album.Description,
            ImagePath = album.ImagePath,
            CreatedAt = album.CreatedAt,
            RecipeCount = await _db.Recipes.CountAsync(r => r.AlbumId == id)
        };
    }

}