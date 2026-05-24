using RecipeBoxServer.DTOs.Albums;

namespace RecipeBoxServer.Services;

public interface IAlbumService
{
    Task<IEnumerable<AlbumDto>> GetAllAsync();
    Task<AlbumDto?> GetByIdAsync(int id);
    Task<AlbumDto> CreateAsync(CreateAlbumDto dto);
    Task<AlbumDto?> UpdateAsync(int id, UpdateAlbumDto dto);
}