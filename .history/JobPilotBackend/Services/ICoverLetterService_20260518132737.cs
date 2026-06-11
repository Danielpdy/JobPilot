using ErrorOr;
public interface ICoverLetterService
{
    Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto request, int userId);
}