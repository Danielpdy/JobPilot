using ErrorOr;
public interface IResumeAnalyzerService
{
    Task<ErrorOr<Success>> UploadAnalyzeAsync(UploadResumeRequestDto resume, int userId);
}