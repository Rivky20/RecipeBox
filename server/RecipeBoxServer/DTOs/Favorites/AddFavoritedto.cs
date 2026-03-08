using System.ComponentModel.DataAnnotations;

namespace RecipeBoxServer.DTOs.Favorites;

public class AddFavoriteDto
{
    [Required]
    public int RecipeId { get; set; }
}