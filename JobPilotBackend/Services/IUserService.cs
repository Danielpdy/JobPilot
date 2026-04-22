
using ErrorOr;
using Microsoft.AspNetCore.Mvc;

public interface IUserService
{
    //Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId);
    Task<ErrorOr<Success>> RegisterProfileAsync(RegisterProfileDto request, int userId);
    Task<ErrorOr<UserProfileDto>> GetUserProfileAsync(int userId);
    Task<ErrorOr<ResumeAnalysesDto>> GetAnalysesUsedAsync(int userId);
    Task<ErrorOr<JobRefreshesDto>> GetJobRefreshesLeftAsync(int userId);
}