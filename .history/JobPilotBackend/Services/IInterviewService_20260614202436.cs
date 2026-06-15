using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<Success>> StartInterview(InterviewConfigDto request, int userId);
}