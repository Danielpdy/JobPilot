using
public interface ICoverLetterService
{
    Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync()
}