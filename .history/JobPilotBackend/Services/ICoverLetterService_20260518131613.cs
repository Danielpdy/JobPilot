using ErrorOr;
public interface ICoverLetterService
{
    Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto);
}