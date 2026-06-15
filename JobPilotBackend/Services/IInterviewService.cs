using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<Success>> StartInterviewAsync(InterviewConfigDto request, int userId);
}