using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecipeBoxServer.Data;
using RecipeBoxServer.DTOs.Users;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.Services;

public class AuthService : IAuthService
{
    private readonly RecipeBoxDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(RecipeBoxDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower());
        if (exists)
            throw new InvalidOperationException("Email already in use.");

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            UserName = dto.UserName,
            Role = "User"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            UserName = user.UserName
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginUserDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (user.IsBlocked)
            throw new UnauthorizedAccessException("Your account has been blocked.");

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            UserName = user.UserName
        };
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured.")));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}