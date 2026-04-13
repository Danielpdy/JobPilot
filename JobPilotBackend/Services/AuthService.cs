using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErrorOr;

public class AuthService : IAuthService
{
    private readonly JwtService _jwtService;
    private readonly JobPilotDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(JwtService jwtService, JobPilotDbContext context, IConfiguration configuration)
    {
        _jwtService = jwtService;
        _context = context;
        _configuration = configuration;
    }
    public async Task<ErrorOr<TokenResponseDto>> LoginAsync(LoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
        {
            return UserErrors.NotFound;
        }
        ;

        if(new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHashed, request.Password)
            == PasswordVerificationResult.Failed)
        {
            return AuthErrors.IncorrectPassword;
        }

        var tokenResponse = new TokenResponseDto(
            AccessToken: _jwtService.CreateToken(user),
            RefreshToken: await _jwtService.SaveRefreshToken(user),
            IsOnboarded: user.IsOnboarded
        );
        
        return tokenResponse;
    }

    public async Task<ErrorOr<TokenResponseDto>> OauthAsync(OauthDto request)
    {
        string email, firstName, lastName;

        if (request.Provider == "google")
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new [] { _configuration["Google:ClientId"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

            email = payload.Email;
            firstName = payload.GivenName ?? "";
            lastName = payload.FamilyName ?? "";
        }
        else if (request.Provider == "github")
        {
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Add("Authorization",$"Bearer {request.AccessToken}");
            http.DefaultRequestHeaders.Add("User-Agent", "JobPilot");

            var response = await http.GetAsync("https://api.github.com/user");
            if (!response.IsSuccessStatusCode)
            {
                return AuthErrors.AuthGithubFailed;
            };

            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = json.RootElement;

            email = root.GetProperty("email").GetString() ?? "";
            if (string.IsNullOrEmpty(email))
            {
                return AuthErrors.GitHubEmailNotPublic;
            };

            var name = root.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
            var parts = name.Split(' ', 2);
            firstName = parts[0];
            lastName = parts.Length > 1 ? parts[1] : "";
        }
        else
        {
            return AuthErrors.OAuthFailed;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            user = new User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                PasswordHashed = null
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        

        return new TokenResponseDto(
            AccessToken: _jwtService.CreateToken(user),
            RefreshToken: await _jwtService.SaveRefreshToken(user),
            IsOnboarded: user.IsOnboarded
        );
    }

    public async Task<ErrorOr<TokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user is null)
        {
            return AuthErrors.NotRefreshTokenFound;
        }
        ;

        var tokenResponse = new TokenResponseDto(
            AccessToken: _jwtService.CreateToken(user),
            RefreshToken: await _jwtService.SaveRefreshToken(user),
            IsOnboarded: user.IsOnboarded
        );

        return tokenResponse;
    }

    public async Task<ErrorOr<Success>> RegisterAsync(SignupDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return UserErrors.EmailTaken;
        }

        var PasswordHashed = new PasswordHasher<User>()
            .HashPassword(null, request.Password);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHashed = PasswordHashed,
            IsOnboarded = false
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Result.Success;

    }
}