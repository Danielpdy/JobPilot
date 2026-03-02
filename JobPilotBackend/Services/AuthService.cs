using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class AuthService : IAuthService
{
    private readonly JwtService _jwtService;
    private readonly JobPilotDbContext _context;

    public AuthService(JwtService jwtService, JobPilotDbContext context)
    {
        _jwtService = jwtService;
        _context = context;
    }
    public async Task<TokenResponseDto> LoginAsync(LoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null) return null;

        if(new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHashed, request.Password)
            == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var tokenResponse = new TokenResponseDto(
            AccessToken: _jwtService.CreateToken(user),
            RefreshToken: await _jwtService.SaveRefreshToken(user)
        );
        
        return tokenResponse;
    }

    public async Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user is null) return null;

        var tokenResponse = new TokenResponseDto(
            AccessToken: _jwtService.CreateToken(user),
            RefreshToken: await _jwtService.SaveRefreshToken(user)
        );

        return tokenResponse;
    }

    public async Task<User> RegisterAsync(SignupDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return null;
        }

        var PasswordHashed = new PasswordHasher<User>()
            .HashPassword(null, request.Password);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHashed = PasswordHashed
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;

    }
}