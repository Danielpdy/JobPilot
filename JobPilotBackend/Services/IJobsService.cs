
public interface IJobsService
{
    Task<List<GroupedJobResultDto>> JobSearchAsync(JobSearchRequestDto request);
    Task<string> SaveLikedJobs(List<SwipeDto> request, int userId);
}