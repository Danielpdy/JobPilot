using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<Success>> StartInterviewAs(InterviewConfigDto request, int userId);
}