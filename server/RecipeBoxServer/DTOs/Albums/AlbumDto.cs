namespace RecipeBoxServer.DTOs.Albums;

public class AlbumDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int RecipeCount { get; set; }
}