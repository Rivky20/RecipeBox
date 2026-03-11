namespace RecipeBoxServer.Models;

public class Album
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}