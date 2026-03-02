using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    readonly IConfiguration _configuration;
    readonly JobPilotDbContext _context;
    public JwtService(IConfiguration configuration, JobPilotDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration.GetValue<string>("Jwt:Key")!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _configuration.GetValue<string>("Jwt:Issuer"),
            audience: _configuration.GetValue<string>("Jwt:Audience"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiresInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public async Task<string> SaveRefreshToken(User user)
    {
        string refreshToken = CreateRefreshToken();
        DateTime refreshTokenExpiresAt = DateTime.UtcNow.AddDays(1);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = refreshTokenExpiresAt;

        await _context.SaveChangesAsync();
        
        return refreshToken;
    }

    public string CreateRefreshToken()
    {
        var randomNumber= new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        
        return Convert.ToBase64String(randomNumber);
    }

    
}