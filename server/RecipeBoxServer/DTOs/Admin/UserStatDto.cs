namespace RecipeBoxServer.DTOs.Admin;

public class UserStatDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsBlocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public int RecipeCount { get; set; }
}