using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<INter>> StartInterviewAsync(InterviewConfigDto request, int userId);
}