using System.Collections.Specialized;
using System.ComponentModel;
using System.Text;

public record SignupDto(string FirstName, string LastName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record OauthDto(string? IdToken, string? AccessToken, string Provider);
public record RefreshTokenRequestDto(string RefreshToken);
public record TokenResponseDto(string AccessToken, string RefreshToken, bool IsOnboarded);
public record RegisterProfileDto(string JobTitle, string ExperienceLevel, List<string> Skills, 
string WorkType, string SalaryRange, string? PreferredLocation);

