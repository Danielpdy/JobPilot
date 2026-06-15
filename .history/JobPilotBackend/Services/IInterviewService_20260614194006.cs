using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<Success>> GetInterviewQuestionsAsync(InterviewConfigDto request, int userId);
}