using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBoxServer.DTOs.Admin;
using RecipeBoxServer.DTOs.Users;
using RecipeBoxServer.Services;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPatch("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id)
    {
        var result = await _userService.BlockUserAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "User blocked." });
    }

    [HttpPatch("{id:guid}/unblock")]
    public async Task<IActionResult> Unblock(Guid id)
    {
        var result = await _userService.UnblockUserAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "User unblocked." });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<SystemStatsDto>> GetStats()
    {
        var stats = await _userService.GetStatsAsync();
        return Ok(stats);
    }
}