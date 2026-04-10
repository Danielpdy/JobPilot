
using ErrorOr;
using Microsoft.AspNetCore.Mvc;

public interface IUserService
{
    Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId);
    Task<ErrorOr<Success>> RegisterProfileAsync(RegisterProfileDto request, int userId);
}