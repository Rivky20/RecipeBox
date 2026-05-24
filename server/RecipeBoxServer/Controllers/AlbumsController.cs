using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBoxServer.DTOs.Albums;
using RecipeBoxServer.Services;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/albums")]
public class AlbumsController : ControllerBase
{
    private readonly IAlbumService _albumService;

    public AlbumsController(IAlbumService albumService)
    {
        _albumService = albumService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlbumDto>>> GetAll()
    {
        var albums = await _albumService.GetAllAsync();
        return Ok(albums);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AlbumDto>> GetById(int id)
    {
        var album = await _albumService.GetByIdAsync(id);
        if (album == null) return NotFound();
        return Ok(album);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AlbumDto>> Create([FromBody] CreateAlbumDto dto)
    {
        var album = await _albumService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = album.Id }, album);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AlbumDto>> Update(int id, [FromBody] UpdateAlbumDto dto)
    {
        var album = await _albumService.UpdateAsync(id, dto);
        if (album == null) return NotFound();
        return Ok(album);
    }

}