
using ErrorOr;
using Microsoft.AspNetCore.Mvc;

public interface IUserService
{
    Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId);
}