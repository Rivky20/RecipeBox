using System.ComponentModel.DataAnnotations;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.DTOs.Recipes;

public class UpdateRecipeDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public string? ImagePath { get; set; }

    [Required]
    public RecipeType RecipeType { get; set; }

    // Required when RecipeType = Link
    public string? Link { get; set; }

    // Required when RecipeType = Text
    public string? Ingredients { get; set; }
    public string? Instructions { get; set; }

    [Required]
    public int AlbumId { get; set; }
}