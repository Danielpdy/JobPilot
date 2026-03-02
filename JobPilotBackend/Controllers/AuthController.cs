//using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly JobPilotDbContext _context;

    public AuthController(IAuthService authService, JobPilotDbContext context)
    {
        _authService = authService;
        _context = context;
    }
    

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(SignupDto request)
    {
        var user = await _authService.RegisterAsync(request);

        if (user is null)
        {
            return BadRequest("Email already exists");
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login(LoginDto request)
    {
        var token = _authService.LoginAsync(request);

        if (token is null)
        {
            return BadRequest("Email or password are incorrect");
        }

        return Ok(new
        {
            message = "Login succesful",
            token
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponseDto>> GetRefreshToken(RefreshTokenRequestDto request)
    {
        var token = _authService.RefreshTokenAsync(request);

        if (token is null)
        {
            return BadRequest("Jwt token refresh failed");
        }

        return Ok(new
        {
            token
        });
    }
}