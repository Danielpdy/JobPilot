using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<Success>> StartInter(InterviewConfigDto request, int userId);
}