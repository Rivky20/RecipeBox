namespace RecipeBoxServer.DTOs.Admin;

public class SystemStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalRecipes { get; set; }
    public int TotalAlbums { get; set; }
    public int BlockedUsers { get; set; }
    public List<RecentRecipeDto> RecentRecipes { get; set; } = new();
}

public class RecentRecipeDto
{
    public int RecipeId { get; set; }
    public string RecipeName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}