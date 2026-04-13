//using Microsoft.AspNetCore.Components;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly JobPilotDbContext _context;

    public AuthController(IAuthService authService, JobPilotDbContext context)
    {
        _authService = authService;
        _context = context;
    }
    

    [HttpPost("register")]
    public async Task<IActionResult> Register(SignupDto request)
    {
        var user = await _authService.RegisterAsync(request);

        return user.Match(
            _ => NoContent(),
            errors => MapErrors(errors)
        );
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        var token = await _authService.LoginAsync(request);

       return token.Match(
        accessToken => Ok(accessToken),
        errors => MapErrors(errors)
       );
    }

    [HttpPost("oauth")]
    public async Task<IActionResult> Oauth(OauthDto request)
    {
        try{
            var token = await _authService.OauthAsync(request);

            return token.Match(
                accessToken => Ok(accessToken),
                errors => MapErrors(errors)
            );
        }
        catch (InvalidJwtException)
        {
            return Unauthorized("Invalid Google token");
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> GetRefreshToken(RefreshTokenRequestDto request)
    {
        var token = await _authService.RefreshTokenAsync(request);
         
        return token.Match(
            accessToken => Ok(accessToken),
            errors => MapErrors(errors)
        );
    }
}