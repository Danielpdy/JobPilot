using ErrorOr;
public interface IJobsService
{
    Task<ErrorOr<List<GroupedJobResultDto>>> JobSearchAsync(int userId, bool forceRefresh = false);
    Task<ErrorOr<Success>> SaveLikedJobs(List<SwipeDto> request, int userId);
    Task<ErrorOr<List<JobResultDto>>> GetLikedJobs(int userId);
}