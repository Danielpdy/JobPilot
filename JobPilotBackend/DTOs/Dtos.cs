using System.Collections.Specialized;
using System.ComponentModel;
using System.Security.Cryptography.X509Certificates;
using System.Text;

public record SignupDto(string FirstName, string LastName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record OauthDto(string? IdToken, string? AccessToken, string Provider);
public record RefreshTokenRequestDto(string RefreshToken);
public record TokenResponseDto(string AccessToken, string RefreshToken, bool IsOnboarded);
public record RegisterProfileDto(string JobTitle, string ExperienceLevel, List<string> Skills, 
string WorkType, string SalaryRange, string? PreferredLocation);
public record JobSearchRequestDto(string What, string? Where, int Page);
public record JobResultDto(string Id, string Title, string Company, string Location, decimal? SalaryMin, decimal SalaryMax,
string Description, string RedirectUrl, List<string> Tags, float AiMatchScore, string AiMatchReason);

