namespace RecipeBoxServer.DTOs.Recipes;

public class RecipeQueryDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; } // "date" | "name"
    public int? AlbumId { get; set; }
}