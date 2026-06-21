using ErrorOr;

public interface IInterviewService
{
    Task<ErrorOr<InterviewStartDto>> StartInterviewAsync(InterviewConfigDto request, int userId);
}