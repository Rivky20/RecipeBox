using RecipeBoxServer.Models;

namespace RecipeBoxServer.DTOs.Recipes;

public class RecipeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    public RecipeType RecipeType { get; set; }
    public string? Link { get; set; }
    public string? Ingredients { get; set; }
    public string? Instructions { get; set; }
    public int AlbumId { get; set; }
    public string AlbumName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFavorite { get; set; }
}