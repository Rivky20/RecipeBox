namespace RecipeBoxServer.Models;

public class UserFavorite
{
    public Guid UserId { get; set; }
    public int RecipeId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
}