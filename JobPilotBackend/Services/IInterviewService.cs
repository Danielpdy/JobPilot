using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<InterviewStartDto>> StartInterviewAsync(InterviewConfigDto request, int userId);
    Task<ErrorOr<SubmitAnswerResponseDto>> SubmitAnswerAndGetNextQuestionAsync(SubmitAnswerRequestDto request, int userId);
    Task<ErrorOr<List<InterviewHistoryDto>>> GetUserInterviewsAsync(int userId);
}
