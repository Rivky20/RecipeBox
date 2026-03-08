using System.ComponentModel.DataAnnotations;

namespace RecipeBoxServer.DTOs.Albums;

public class CreateAlbumDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
}