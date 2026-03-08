namespace RecipeBoxServer.Models;

public class Recipe
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
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Album Album { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<UserFavorite> FavoritedBy { get; set; } = new List<UserFavorite>();
}