using System.Collections.Specialized;
using System.ComponentModel;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json.Serialization;

public record SignupDto(string FirstName, string LastName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record OauthDto(string? IdToken, string? AccessToken, string Provider);
public record RefreshTokenRequestDto(string RefreshToken);
public record TokenResponseDto(string AccessToken, string RefreshToken, bool IsOnboarded);
public record RegisterProfileDto(string JobTitle, string ExperienceLevel, List<string> Skills, 
string WorkType, string SalaryRange, string? PreferredLocation);
public record JobSearchRequestDto(string What, string? Where, int Page);
public record JobResultDto(string Id, string Title, string Company, string Location, decimal? SalaryMin, decimal? SalaryMax,
    string RedirectUrl, string? Created, string? ContractTime = null, string? Category = null);

public record SwipeDto(string Id, string Title, string Company, string? Location, decimal? SalaryMin, decimal? SalaryMax,
    string RedirectUrl, string Action, string? Created, string? ContractTime = null, string? Category = null, string? LocationSummary = null);

// Adzuna dtos
public record AdzunaCompanyDto([property: System.Text.Json.Serialization.JsonPropertyName("display_name")] string? DisplayName);
public record AdzunaLocationDto(
    [property: System.Text.Json.Serialization.JsonPropertyName("display_name")] string? DisplayName,
    [property: System.Text.Json.Serialization.JsonPropertyName("area")] List<string>? Area
);
public record AdzunaCategoryDto([property: System.Text.Json.Serialization.JsonPropertyName("label")] string? Label);
public record AdzunaJobDto(
    string? Id,
    string? Title,
    AdzunaCompanyDto? Company,
    AdzunaLocationDto? Location,
    [property: System.Text.Json.Serialization.JsonPropertyName("salary_min")] decimal? SalaryMin,
    [property: System.Text.Json.Serialization.JsonPropertyName("salary_max")] decimal? SalaryMax,
    [property: System.Text.Json.Serialization.JsonPropertyName("redirect_url")] string? RedirectUrl,
    string? Created,
    [property: System.Text.Json.Serialization.JsonPropertyName("contract_time")] string? ContractTime,
    AdzunaCategoryDto? Category
);
public record AdzunaResponseDto(List<AdzunaJobDto>? Results);
public record RedisRequestDto(string Key, List<GroupedJobResultDto> Jobs);
public record ApplyOptionDto(string Location, string RedirectUrl);
public record GroupedJobResultDto(
    string Id,
    string Title,
    string Company,
    List<string> Locations,
    string LocationSummary,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string RedirectUrl,
    List<ApplyOptionDto> ApplyOptions,
    string? Created,
    string? ContractTime,
    string? Category
);
public record UploadResumeRequestDto(IFormFile File);
public record ResumeAnalysisDto(
    int UserId,
    [property: JsonPropertyName("resume_score")] int ResumeScore,
    [property: JsonPropertyName("score_label")] string ScoreLabel,
    [property: JsonPropertyName("score_summary")] string ScoreSummary,
    [property: JsonPropertyName("actionable_improvements")] List<string> Improvements
);
public record ResumeAnalysesDto(int ResumeAnalyses);
public record JobRefreshesDto(int RefreshesLeft);
public record LastAnalysisDateDto(string? LastAnalysisDate);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Token, string NewPassword);
public record UserProfileDto(
    string UserFirstName,
    string UserLastName,
    string UserEmail,
    string UserJobTitle,
    string UserExperienceLevel,
    string UserWorkType,
    string UserSalaryRange,
    List<string> UserSkills
);




