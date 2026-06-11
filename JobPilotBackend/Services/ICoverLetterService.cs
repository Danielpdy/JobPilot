using ErrorOr;
public interface ICoverLetterService
{
    Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto request, int userId);
    Task<ErrorOr<CoverLetterHistoryDto>> GetCoverLetterHistoryAsync(int userId);
    Task<ErrorOr<Deleted>> DeleteCoverLetterAsync(int coverLetterId, int userId);
}