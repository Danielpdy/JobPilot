using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<InterviewQuestionDto>> GetInterviewQuestionsAsync(InterviewConfigDto request, int userId);
}