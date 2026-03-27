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
public record JobSearchRequestDto(string What, string? Where, int Page, int UserId);
public record JobResultDto(string Id, string Title, string Company, string Location, decimal? SalaryMin, decimal? SalaryMax,
    string Description, string RedirectUrl, string? Created, string? ContractTime = null, string? Category = null);

// Adzuna dtos
public record AdzunaCompanyDto([property: System.Text.Json.Serialization.JsonPropertyName("display_name")] string? DisplayName);
public record AdzunaLocationDto([property: System.Text.Json.Serialization.JsonPropertyName("display_name")] string? DisplayName);
public record AdzunaCategoryDto([property: System.Text.Json.Serialization.JsonPropertyName("label")] string? Label);
public record AdzunaJobDto(
    string? Id,
    string? Title,
    AdzunaCompanyDto? Company,
    AdzunaLocationDto? Location,
    [property: System.Text.Json.Serialization.JsonPropertyName("salary_min")] decimal? SalaryMin,
    [property: System.Text.Json.Serialization.JsonPropertyName("salary_max")] decimal? SalaryMax,
    string? Description,
    [property: System.Text.Json.Serialization.JsonPropertyName("redirect_url")] string? RedirectUrl,
    string? Created,
    [property: System.Text.Json.Serialization.JsonPropertyName("contract_time")] string? ContractTime,
    AdzunaCategoryDto? Category
);
public record AdzunaResponseDto(List<AdzunaJobDto>? Results);
public record RedisRequestDto(string Key, List<JobResultDto> Jobs);




