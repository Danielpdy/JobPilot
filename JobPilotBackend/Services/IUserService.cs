
public interface IUserService
{
    Task<string> UploadResumeAsync(UploadResumeRequestDto request, int userId);
}