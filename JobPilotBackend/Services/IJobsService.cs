using ErrorOr;
public interface IJobsService
{
    Task<ErrorOr<List<GroupedJobResultDto>>> JobSearchAsync(JobSearchRequestDto request);
    Task<string> SaveLikedJobs(List<SwipeDto> request, int userId);
}