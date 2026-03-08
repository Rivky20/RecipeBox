using Microsoft.EntityFrameworkCore;
using RecipeBoxServer.Models;

namespace RecipeBoxServer.Data;

public class RecipeBoxDbContext : DbContext
{
    public RecipeBoxDbContext(DbContextOptions<RecipeBoxDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite PK for UserFavorites
        modelBuilder.Entity<UserFavorite>()
            .HasKey(uf => new { uf.UserId, uf.RecipeId });

        // UserFavorite → User
        modelBuilder.Entity<UserFavorite>()
            .HasOne(uf => uf.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(uf => uf.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserFavorite → Recipe
        modelBuilder.Entity<UserFavorite>()
            .HasOne(uf => uf.Recipe)
            .WithMany(r => r.FavoritedBy)
            .HasForeignKey(uf => uf.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Recipe → Album
        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.Album)
            .WithMany(a => a.Recipes)
            .HasForeignKey(r => r.AlbumId)
            .OnDelete(DeleteBehavior.Cascade);

        // Recipe → User
        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.User)
            .WithMany(u => u.Recipes)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        modelBuilder.Entity<UserFavorite>()
            .HasIndex(uf => uf.UserId);

        modelBuilder.Entity<UserFavorite>()
            .HasIndex(uf => uf.RecipeId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // RecipeType stored as string in DB
        modelBuilder.Entity<Recipe>()
            .Property(r => r.RecipeType)
            .HasConversion<string>();
    }
}